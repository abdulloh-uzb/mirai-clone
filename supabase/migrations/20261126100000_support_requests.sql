-- Support requests: rate limits, extra ticket columns and the private
-- bucket for screenshots. Clients never touch these directly; server actions
-- use the service role.

create table public.rate_limits (
  key text not null,
  window_start timestamptz not null,
  hits integer not null default 0,
  primary key (key, window_start)
);

create index rate_limits_window_start_idx on public.rate_limits (window_start);

alter table public.rate_limits enable row level security;
revoke all on table public.rate_limits from anon, authenticated;

-- Counts one hit on `key` in the current fixed window. True = allowed.
create function public.hit_rate_limit(key text, max integer, window_seconds integer)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_window timestamptz;
  current_hits integer;
begin
  if max < 1 or window_seconds < 1 then
    raise exception 'max and window_seconds must be at least 1';
  end if;

  current_window := to_timestamp(
    floor(extract(epoch from now()) / window_seconds) * window_seconds
  );

  insert into public.rate_limits as r (key, window_start, hits)
  values (hit_rate_limit.key, current_window, 1)
  on conflict on constraint rate_limits_pkey do update set hits = r.hits + 1
  returning r.hits into current_hits;

  delete from public.rate_limits where window_start < now() - interval '1 day';

  return current_hits <= max;
end;
$$;

revoke execute on function public.hit_rate_limit(text, integer, integer)
  from public, anon, authenticated;
grant execute on function public.hit_rate_limit(text, integer, integer)
  to service_role;

alter table public.tickets
  add column page_url text check (length(page_url) <= 2048),
  add column attachment_path text,
  add column details jsonb not null default '{}'
    check (jsonb_typeof(details) = 'object');

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'support-attachments',
  'support-attachments',
  false,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp']
);
