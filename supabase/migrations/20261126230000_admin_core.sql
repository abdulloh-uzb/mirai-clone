-- Admin core (ticket 10): dashboard stats in one round trip and Student search.
-- Both are security definer with an is_admin() check.

create or replace function public.admin_dashboard_stats()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  result jsonb;
begin
  if not public.is_admin() then
    raise exception 'admin only' using errcode = '42501';
  end if;

  select jsonb_build_object(
    'sales_cents', jsonb_build_object(
      'today', coalesce((select sum(amount_cents) from public.orders
        where status in ('paid', 'partially_refunded') and created_at >= date_trunc('day', now())), 0),
      'd7', coalesce((select sum(amount_cents) from public.orders
        where status in ('paid', 'partially_refunded') and created_at >= now() - interval '7 days'), 0),
      'd30', coalesce((select sum(amount_cents) from public.orders
        where status in ('paid', 'partially_refunded') and created_at >= now() - interval '30 days'), 0)
    ),
    'enrollments', jsonb_build_object(
      'today', (select count(*) from public.enrollments where created_at >= date_trunc('day', now())),
      'd7', (select count(*) from public.enrollments where created_at >= now() - interval '7 days'),
      'd30', (select count(*) from public.enrollments where created_at >= now() - interval '30 days')
    ),
    'exam_submitted', (select count(*) from public.exam_attempts where submitted_at is not null),
    'exam_passed', (select count(*) from public.exam_attempts where submitted_at is not null and passed),
    'avg_completion_seconds', (
      select extract(epoch from avg(completed_at - created_at))
      from public.enrollments where completed_at is not null
    ),
    'reports_by_status', coalesce((
      select jsonb_object_agg(status, n)
      from (select status, count(*) as n from public.completion_reports group by status) r
    ), '{}'::jsonb),
    'refunds_30d', jsonb_build_object(
      'count', (select count(*) from public.refunds
        where status = 'processed' and updated_at >= now() - interval '30 days'),
      'cents', coalesce((select sum(amount_cents) from public.refunds
        where status = 'processed' and updated_at >= now() - interval '30 days'), 0)
    ),
    'ai_chats_7d', (select count(*) from public.ai_conversations
      where created_at >= now() - interval '7 days')
  ) into result;

  return result;
end;
$$;

revoke execute on function public.admin_dashboard_stats() from public, anon;
grant execute on function public.admin_dashboard_stats() to authenticated;

create or replace function public.admin_search_students(
  q text,
  lim integer default 25,
  off integer default 0
)
returns table (
  user_id uuid,
  email text,
  first_name text,
  last_name text,
  legal_name text,
  license_no text,
  created_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  pattern text := '%' || replace(replace(replace(trim(coalesce(q, '')), '\', '\\'), '%', '\%'), '_', '\_') || '%';
begin
  if not public.is_admin() then
    raise exception 'admin only' using errcode = '42501';
  end if;

  return query
  select p.user_id, u.email::text, p.first_name, p.last_name, p.legal_name,
         p.license_no, p.created_at
  from public.profiles p
  join auth.users u on u.id = p.user_id
  where p.role = 'student'
    and (
      trim(coalesce(q, '')) = ''
      or u.email ilike pattern
      or (p.first_name || ' ' || p.last_name) ilike pattern
      or coalesce(p.legal_name, '') ilike pattern
      or coalesce(p.license_no, '') ilike pattern
      or exists (
        select 1 from public.enrollments e
        where e.user_id = p.user_id and coalesce(e.citation_no, '') ilike pattern
      )
    )
  order by p.created_at desc
  limit greatest(1, least(coalesce(lim, 25), 100))
  offset greatest(0, coalesce(off, 0));
end;
$$;

revoke execute on function public.admin_search_students(text, integer, integer) from public, anon;
grant execute on function public.admin_search_students(text, integer, integer) to authenticated;
