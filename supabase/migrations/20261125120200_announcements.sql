-- Announcements shown in the top bar, one UI language per row (ticket 02).

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  locale text not null check (locale in ('en', 'ja', 'es', 'ru')),
  message text not null check (length(trim(message)) > 0),
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.announcements is
  'Announcement bar messages per UI language. Anyone reads published rows; only Admins write.';

create index announcements_published_locale_idx
  on public.announcements (locale, created_at desc)
  where published;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger announcements_set_updated_at
  before update on public.announcements
  for each row execute function public.set_updated_at();

alter table public.announcements enable row level security;

create policy "Anyone reads published announcements"
  on public.announcements for select
  to anon, authenticated
  using (published);

-- TODO(spec): Admin read and write policies need public.is_admin(), which ticket 03
-- creates. Until a later migration adds them there are no client write policies:
-- RLS denies every client insert, update and delete, and only the service role writes.
