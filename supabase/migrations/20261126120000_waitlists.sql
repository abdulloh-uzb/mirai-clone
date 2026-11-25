-- Waitlists (ticket 07). Both lists are written only by server actions with
-- the service role, after the honeypot and rate limit. Only an Admin reads.

create table public.classroom_waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null check (email ~ '^[^@\s]+@[^@\s]+$' and length(email) <= 320),
  county_id uuid not null references public.counties (id) on delete restrict,
  locale text not null check (locale in ('en', 'ja', 'es', 'ru')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index classroom_waitlist_county_id_idx on public.classroom_waitlist (county_id);

create trigger classroom_waitlist_set_updated_at
before update on public.classroom_waitlist
for each row execute function public.set_updated_at();

alter table public.classroom_waitlist enable row level security;

revoke all on table public.classroom_waitlist from anon, authenticated;
grant select on table public.classroom_waitlist to authenticated;

create policy "classroom_waitlist: admin reads"
on public.classroom_waitlist for select
to authenticated
using ((select public.is_admin()));

-- The state waitlist no longer takes direct client inserts: they would skip
-- the rate limit and the honeypot.
drop policy "state_waitlist: anyone joins" on public.state_waitlist;
revoke insert on table public.state_waitlist from anon, authenticated;
