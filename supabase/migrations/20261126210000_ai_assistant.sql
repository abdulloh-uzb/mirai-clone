-- AI assistant: knowledge-base search, conversation logging columns, the
-- active-exam check and a daily cost view. Clients never touch kb_chunks or
-- search_kb; the chat route uses the service role.

alter table public.kb_chunks
  add column title text,
  add column url text,
  add column fts tsvector generated always as (
    to_tsvector('simple', coalesce(title, '') || ' ' || content)
  ) stored;

create index kb_chunks_fts_idx on public.kb_chunks using gin (fts);

-- Ranked chunks for a question. Words are OR-ed so a natural sentence still
-- finds something; the user's locale ranks first, English is the fallback.
-- TODO(spec): pgvector similarity when an embedding key exists.
create function public.search_kb(p_query text, p_locale text, p_limit integer default 3)
returns table (id uuid, source text, locale text, title text, url text, content text, rank real)
language sql
stable
security definer
set search_path = ''
as $$
  with q as (
    select replace(plainto_tsquery('simple', p_query)::text, '&', '|')::tsquery as tsq
  )
  select c.id, c.source, c.locale, c.title, c.url, c.content,
         ts_rank(c.fts, q.tsq) as rank
  from public.kb_chunks c, q
  where c.locale in (p_locale, 'en')
    and (
      c.fts @@ q.tsq
      -- Japanese has no spaces, so the "simple" parser cannot split it.
      or (length(trim(p_query)) between 2 and 40 and c.content ilike '%' || trim(p_query) || '%')
    )
  order by (c.locale = p_locale) desc, ts_rank(c.fts, q.tsq) desc
  limit greatest(1, least(coalesce(p_limit, 3), 10));
$$;

revoke execute on function public.search_kb(text, text, integer)
  from public, anon, authenticated;
grant execute on function public.search_kb(text, text, integer) to service_role;

alter table public.ai_conversations
  add column ip_hash text,
  add column flagged boolean not null default false,
  add column handed_off_at timestamptz,
  add column page text;

alter table public.ai_messages
  add column tokens_in integer,
  add column tokens_out integer,
  add column cost_usd numeric(10, 6),
  add column flagged boolean not null default false;

-- Daily cost, readable by admins through a function (the view is closed).
create view public.ai_usage_daily as
select date_trunc('day', created_at)::date as day,
       count(*) filter (where role = 'assistant') as answers,
       coalesce(sum(tokens_in), 0) as tokens_in,
       coalesce(sum(tokens_out), 0) as tokens_out,
       coalesce(sum(cost_usd), 0) as cost_usd
from public.ai_messages
group by 1;

revoke all on public.ai_usage_daily from public, anon, authenticated;
grant select on public.ai_usage_daily to service_role;

create function public.admin_ai_usage_daily()
returns setof public.ai_usage_daily
language sql
stable
security definer
set search_path = ''
as $$
  select * from public.ai_usage_daily where public.is_admin() order by day desc;
$$;

revoke execute on function public.admin_ai_usage_daily() from public, anon;
grant execute on function public.admin_ai_usage_daily() to authenticated, service_role;

-- True while the signed-in user has an unsubmitted, unexpired exam attempt.
-- exam_attempts rows are not readable by clients before submit, hence a
-- security definer function. Ticket 05 adds `expires_at`; until then an
-- attempt counts as active for 4 hours after it started.
create function public.has_active_exam()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.exam_attempts ea
    join public.enrollments e on e.id = ea.enrollment_id
    where e.user_id = (select auth.uid())
      and ea.submitted_at is null
      and coalesce(
        (to_jsonb(ea) ->> 'expires_at')::timestamptz,
        ea.started_at + interval '4 hours'
      ) > now()
  );
$$;

revoke execute on function public.has_active_exam() from public, anon;
grant execute on function public.has_active_exam() to authenticated, service_role;
