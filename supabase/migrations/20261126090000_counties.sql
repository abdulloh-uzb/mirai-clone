-- Ticket 04: Counties as their own table; every Courthouse (courts row) belongs to one.

create table public.counties (
  id uuid primary key default gen_random_uuid(),
  state_code text not null references public.states (code) on update cascade,
  -- Without the word "County", e.g. "Los Angeles".
  name text not null,
  slug text not null unique check (slug ~ '^[a-z0-9-]+-county$'),
  seat_city text not null,
  popular_rank integer unique check (popular_rank > 0),
  case_lookup_url text,
  instructions jsonb not null default '{}' check (jsonb_typeof(instructions) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (state_code, name)
);

create trigger counties_set_updated_at
before update on public.counties
for each row execute function public.set_updated_at();

alter table public.counties enable row level security;

create policy "counties: anyone reads"
on public.counties for select
to anon, authenticated
using (true);

-- Courthouses: link to a County. No rows exist yet, so the backfill is a no-op.
alter table public.courts
  add column county_id uuid references public.counties (id) on delete restrict;

update public.courts c
set county_id = k.id
from public.counties k
where k.state_code = c.state_code and k.name = c.county;

alter table public.courts alter column county_id set not null;
alter table public.courts drop column county;

create index courts_county_id_idx on public.courts (county_id);
