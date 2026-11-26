-- Ticket 09: completion reporting (batches, retry, timeline timestamps).

alter table public.completion_reports
  add column attempts integer not null default 0,
  add column next_attempt_at timestamptz,
  add column sent_at timestamptz,
  add column accepted_at timestamptz,
  add column rejected_at timestamptz,
  add column court_notified_at timestamptz;

-- Students see status and timestamps, never regulator_ref or error.
grant select (batch_id, sent_at, accepted_at, rejected_at, court_notified_at)
  on table public.completion_reports to authenticated;

create table public.report_batches (
  id uuid primary key default gen_random_uuid(),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  trigger text not null default 'cron' check (trigger in ('cron', 'manual')),
  counts jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.report_batches enable row level security;
revoke all on table public.report_batches from anon, authenticated;
grant select on table public.report_batches to authenticated;

create policy "report_batches: admin reads"
on public.report_batches for select
to authenticated
using ((select public.is_admin()));

create trigger report_batches_set_updated_at
before update on public.report_batches
for each row execute function public.set_updated_at();

alter table public.completion_reports
  add constraint completion_reports_batch_id_fkey
  foreign key (batch_id) references public.report_batches (id) on delete set null;
