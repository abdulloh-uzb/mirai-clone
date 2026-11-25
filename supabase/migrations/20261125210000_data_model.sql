-- Ticket 05: the rest of the data model (spec section 13), plus stripe_events
-- and security_questions.
--
-- Access rules, per the access column of spec section 13:
-- * "public read" tables have a select policy for anon and authenticated.
-- * "own read" tables have a select policy scoped to the signed-in Student.
-- * "admin" tables have a select policy that checks public.is_admin().
-- * "server only" tables have no policies and no table privileges for client
--   roles, so only the service role (and security definer functions) can
--   touch them.
-- No client role gets insert, update or delete except state_waitlist (insert).
-- Writes go through server code with the service role or through security
-- definer functions added by later phases.

-- ---------------------------------------------------------------------------
-- States and the waitlist
-- ---------------------------------------------------------------------------

create table public.states (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[A-Z]{2}$'),
  name text not null,
  min_course_minutes integer not null default 0 check (min_course_minutes >= 0),
  exam_questions integer not null default 25 check (exam_questions > 0),
  pass_pct integer not null default 70 check (pass_pct between 1 and 100),
  max_attempts integer not null default 2 check (max_attempts > 0),
  access_days integer not null default 90 check (access_days > 0),
  report_times text[] not null default '{}',
  adapter text,
  active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.states is
  'Per-state course rules. Anyone reads; only the server writes.';

-- "Coming soon — notify me" emails for inactive states.
create table public.state_waitlist (
  id uuid primary key default gen_random_uuid(),
  state_code text not null references public.states (code) on update cascade,
  email text not null check (email ~ '^[^@\s]+@[^@\s]+$' and length(email) <= 320),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index state_waitlist_state_code_idx on public.state_waitlist (state_code);

alter table public.states enable row level security;

create policy "states: anyone reads"
on public.states for select
to anon, authenticated
using (true);

alter table public.state_waitlist enable row level security;

-- Anyone may join; only an Admin reads the list. Clients get insert, not
-- select, so no one can read other people's emails back.
revoke all on table public.state_waitlist from anon, authenticated;
grant insert (state_code, email) on table public.state_waitlist to anon, authenticated;
grant select on table public.state_waitlist to authenticated;

create policy "state_waitlist: anyone joins"
on public.state_waitlist for insert
to anon, authenticated
with check (state_code in (select code from public.states where not active));

create policy "state_waitlist: admin reads"
on public.state_waitlist for select
to authenticated
using ((select public.is_admin()));

-- ---------------------------------------------------------------------------
-- Course structure
-- ---------------------------------------------------------------------------

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  state_code text not null references public.states (code) on update cascade,
  slug text not null unique,
  price_cents integer not null check (price_cents >= 0),
  list_price_cents integer check (list_price_cents >= 0),
  active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index courses_state_code_idx on public.courses (state_code);

-- Per-language text lives in jsonb keyed by UI language: {"en": "...", "ja": "..."}.
create table public.sections (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  position integer not null check (position > 0),
  title jsonb not null default '{}' check (jsonb_typeof(title) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (course_id, position)
);

alter table public.courses enable row level security;
alter table public.sections enable row level security;

create policy "courses: anyone reads"
on public.courses for select
to anon, authenticated
using (true);

create policy "sections: anyone reads"
on public.sections for select
to anon, authenticated
using (true);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.sections (id) on delete cascade,
  position integer not null check (position > 0),
  min_seconds integer not null default 0 check (min_seconds >= 0),
  title jsonb not null default '{}' check (jsonb_typeof(title) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (section_id, position)
);

create table public.lesson_blocks (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  position integer not null check (position > 0),
  type text not null check (type in (
    'rich_text', 'image', 'video', 'callout', 'flip_card', 'scenario', 'drag_to_order'
  )),
  content jsonb not null default '{}' check (jsonb_typeof(content) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (lesson_id, position)
);

create table public.courts (
  id uuid primary key default gen_random_uuid(),
  state_code text not null references public.states (code) on update cascade,
  county text not null,
  slug text not null unique,
  name text not null,
  city text,
  court_code text,
  address text,
  case_lookup_url text,
  citation_regex text,
  instructions jsonb not null default '{}' check (jsonb_typeof(instructions) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index courts_state_code_idx on public.courts (state_code);

alter table public.lessons enable row level security;
alter table public.lesson_blocks enable row level security;
alter table public.courts enable row level security;

create policy "lessons: anyone reads"
on public.lessons for select
to anon, authenticated
using (true);

create policy "courts: anyone reads"
on public.courts for select
to anon, authenticated
using (true);

-- lesson_blocks ("enrolled read") gets its policy below, after enrollments.

-- ---------------------------------------------------------------------------
-- Public site content: anyone reads published rows
-- ---------------------------------------------------------------------------

create table public.faq_items (
  id uuid primary key default gen_random_uuid(),
  locale text not null check (locale in ('en', 'ja', 'es', 'ru')),
  slug text not null,
  title text not null,
  body text not null default '',
  position integer not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (locale, slug)
);

create table public.pages (
  id uuid primary key default gen_random_uuid(),
  locale text not null check (locale in ('en', 'ja', 'es', 'ru')),
  slug text not null,
  title text not null,
  body text not null default '',
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (locale, slug)
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  locale text not null check (locale in ('en', 'ja', 'es', 'ru')),
  slug text not null,
  title text not null,
  excerpt text not null default '',
  body text not null default '',
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (locale, slug)
);

create table public.changelog (
  id uuid primary key default gen_random_uuid(),
  locale text not null check (locale in ('en', 'ja', 'es', 'ru')),
  slug text not null,
  title text not null,
  body text not null default '',
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (locale, slug)
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  locale text not null check (locale in ('en', 'ja', 'es', 'ru')),
  slug text not null,
  title text not null,
  body text not null default '',
  author_name text not null default '',
  rating integer not null default 5 check (rating between 1 and 5),
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (locale, slug)
);

alter table public.faq_items enable row level security;
alter table public.pages enable row level security;
alter table public.posts enable row level security;
alter table public.changelog enable row level security;
alter table public.reviews enable row level security;

create policy "faq_items: anyone reads published"
on public.faq_items for select to anon, authenticated using (published);

create policy "pages: anyone reads published"
on public.pages for select to anon, authenticated using (published);

create policy "posts: anyone reads published"
on public.posts for select to anon, authenticated using (published);

create policy "changelog: anyone reads published"
on public.changelog for select to anon, authenticated using (published);

create policy "reviews: anyone reads published"
on public.reviews for select to anon, authenticated using (published);

-- ---------------------------------------------------------------------------
-- Question bank (server only: the browser never sees questions or answers
-- except through server code that strips the correct answers)
-- ---------------------------------------------------------------------------

create table public.questions (
  id uuid primary key default gen_random_uuid(),
  -- null = final exam pool
  section_id uuid references public.sections (id) on delete cascade,
  locale text not null check (locale in ('en', 'ja', 'es', 'ru')),
  text text not null,
  explanation text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index questions_section_locale_idx on public.questions (section_id, locale);

create table public.answer_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions (id) on delete cascade,
  text text not null,
  is_correct boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index answer_options_question_id_idx on public.answer_options (question_id);

-- ---------------------------------------------------------------------------
-- Orders and enrollments
-- ---------------------------------------------------------------------------

-- TODO(spec): orders cascade with their auth user so accounts can be deleted;
-- revisit if financial records must outlive the account.
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  product text not null check (product in ('online_course', 'classroom', 'exam_reset')),
  amount_cents integer not null check (amount_cents >= 0),
  currency text not null default 'usd',
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'refunded', 'partially_refunded', 'failed')),
  stripe_session_id text unique,
  stripe_payment_intent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index orders_user_id_idx on public.orders (user_id);

create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  course_id uuid not null references public.courses (id),
  order_id uuid references public.orders (id) on delete set null,
  course_locale text not null check (course_locale in ('en', 'ja', 'es', 'ru')),
  court_id uuid,
  citation_no text,
  court_due_date date,
  status text not null default 'active'
    check (status in ('active', 'paused', 'locked', 'completed', 'expired', 'refunded')),
  started_at timestamptz,
  expires_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index enrollments_user_id_idx on public.enrollments (user_id);
create index enrollments_course_id_idx on public.enrollments (course_id);
create unique index enrollments_order_id_key on public.enrollments (order_id);

-- ---------------------------------------------------------------------------
-- Identity checks and certificates
-- ---------------------------------------------------------------------------

create table public.identity_checks (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.enrollments (id) on delete cascade,
  question_key text not null,
  correct boolean not null,
  asked_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index identity_checks_enrollment_id_idx on public.identity_checks (enrollment_id);

-- Personal security questions for identity checks. Only a hash of the answer.
create table public.security_questions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  question text not null,
  answer_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index security_questions_user_id_idx on public.security_questions (user_id);

create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null unique references public.enrollments (id) on delete cascade,
  cert_no text not null unique,
  pdf_path text,
  issued_at timestamptz not null default now(),
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Course activity: progress, quiz and exam attempts
-- ---------------------------------------------------------------------------

-- Written only through server code / security definer RPCs (phase 3) that
-- enforce minimum time.
create table public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.enrollments (id) on delete cascade,
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  seconds_spent integer not null default 0 check (seconds_spent >= 0),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (enrollment_id, lesson_id)
);

create table public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.enrollments (id) on delete cascade,
  section_id uuid not null references public.sections (id),
  question_ids uuid[] not null default '{}',
  answers jsonb not null default '{}',
  score integer,
  passed boolean,
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index quiz_attempts_enrollment_id_idx on public.quiz_attempts (enrollment_id);

create table public.exam_attempts (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.enrollments (id) on delete cascade,
  question_ids uuid[] not null default '{}',
  answers jsonb not null default '{}',
  score integer,
  passed boolean,
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index exam_attempts_enrollment_id_idx on public.exam_attempts (enrollment_id);

-- ---------------------------------------------------------------------------
-- Completion reporting and refunds
-- ---------------------------------------------------------------------------

create table public.completion_reports (
  id uuid primary key default gen_random_uuid(),
  certificate_id uuid not null references public.certificates (id) on delete cascade,
  batch_id uuid,
  status text not null default 'queued'
    check (status in ('queued', 'sent', 'accepted', 'rejected', 'error')),
  regulator_ref text,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index completion_reports_certificate_id_idx on public.completion_reports (certificate_id);
create index completion_reports_status_idx on public.completion_reports (status);

-- Every request and response sent to the state adapter.
create table public.report_attempts (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.completion_reports (id) on delete cascade,
  request jsonb not null default '{}',
  response jsonb,
  at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index report_attempts_report_id_idx on public.report_attempts (report_id);

create table public.refunds (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  amount_cents integer not null check (amount_cents >= 0),
  pct integer not null check (pct in (0, 50, 100)),
  reason text not null default '',
  status text not null default 'requested'
    check (status in ('requested', 'approved', 'rejected', 'processed', 'failed')),
  approved_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index refunds_order_id_idx on public.refunds (order_id);

-- ---------------------------------------------------------------------------
-- AI assistant conversations
-- ---------------------------------------------------------------------------

create table public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  -- null for a Visitor's conversation
  user_id uuid references auth.users (id) on delete cascade,
  locale text not null default 'en' check (locale in ('en', 'ja', 'es', 'ru')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index ai_conversations_user_id_idx on public.ai_conversations (user_id);

create table public.ai_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.ai_conversations (id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system', 'tool')),
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index ai_messages_conversation_id_idx on public.ai_messages (conversation_id);

-- ---------------------------------------------------------------------------
-- Support tickets and the audit log (Admin read)
-- ---------------------------------------------------------------------------

create table public.tickets (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('contact', 'bug', 'ada', 'ai_handoff')),
  user_id uuid references auth.users (id) on delete set null,
  email text not null,
  body text not null,
  status text not null default 'open' check (status in ('open', 'in_progress', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index tickets_status_idx on public.tickets (status);

create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users (id) on delete set null,
  action text not null,
  entity text not null,
  entity_id uuid,
  before jsonb,
  after jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index audit_log_entity_idx on public.audit_log (entity, entity_id);

-- ---------------------------------------------------------------------------
-- Stripe webhook idempotency and the AI knowledge base (server only)
-- ---------------------------------------------------------------------------

create table public.stripe_events (
  id uuid primary key default gen_random_uuid(),
  event_id text not null unique,
  type text not null,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create extension if not exists vector with schema extensions;

create table public.kb_chunks (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  locale text not null check (locale in ('en', 'ja', 'es', 'ru')),
  content text not null,
  embedding extensions.vector(1536),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index kb_chunks_locale_idx on public.kb_chunks (locale);

-- ---------------------------------------------------------------------------
-- Row-level security for the tables above
-- ---------------------------------------------------------------------------

alter table public.questions enable row level security;
alter table public.answer_options enable row level security;
alter table public.orders enable row level security;
alter table public.enrollments enable row level security;
alter table public.identity_checks enable row level security;
alter table public.security_questions enable row level security;
alter table public.certificates enable row level security;
alter table public.stripe_events enable row level security;
alter table public.kb_chunks enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.exam_attempts enable row level security;
alter table public.completion_reports enable row level security;
alter table public.report_attempts enable row level security;
alter table public.refunds enable row level security;
alter table public.ai_conversations enable row level security;
alter table public.ai_messages enable row level security;
alter table public.tickets enable row level security;
alter table public.audit_log enable row level security;

-- Server-only tables: no policies, and no privileges for client roles either,
-- so a missing policy can never be the only thing standing in the way.
revoke all on table
  public.questions,
  public.answer_options,
  public.identity_checks,
  public.security_questions,
  public.stripe_events,
  public.kb_chunks
from anon, authenticated;

-- Own read. Enrollments are created only by the Stripe webhook (server).
create policy "orders: own rows"
on public.orders for select
to authenticated
using (user_id = (select auth.uid()));

create policy "enrollments: own rows"
on public.enrollments for select
to authenticated
using (user_id = (select auth.uid()));

-- Child rows of an enrollment are readable when the enrollment is. The
-- subquery runs under the caller's RLS, so it sees only their own enrollments.
create policy "certificates: own rows"
on public.certificates for select
to authenticated
using (enrollment_id in (select id from public.enrollments));

create policy "lesson_progress: own rows"
on public.lesson_progress for select
to authenticated
using (enrollment_id in (select id from public.enrollments));

-- Attempts become readable once submitted, so answers in progress (and the
-- question set of a running exam) never reach the browser this way.
create policy "quiz_attempts: own submitted rows"
on public.quiz_attempts for select
to authenticated
using (submitted_at is not null and enrollment_id in (select id from public.enrollments));

create policy "exam_attempts: own submitted rows"
on public.exam_attempts for select
to authenticated
using (submitted_at is not null and enrollment_id in (select id from public.enrollments));

-- "own read status": Students see the status of their own reports, not the
-- regulator reference or error text.
revoke all on table public.completion_reports from anon, authenticated;
grant select (id, certificate_id, status, created_at, updated_at)
  on table public.completion_reports to authenticated;

create policy "completion_reports: own rows"
on public.completion_reports for select
to authenticated
using (certificate_id in (select id from public.certificates));

create policy "refunds: own rows"
on public.refunds for select
to authenticated
using (order_id in (select id from public.orders));

create policy "ai_conversations: own rows"
on public.ai_conversations for select
to authenticated
using (user_id = (select auth.uid()));

create policy "ai_messages: own rows"
on public.ai_messages for select
to authenticated
using (conversation_id in (select id from public.ai_conversations));

-- "enrolled read": a Student with an active, unexpired enrollment in the
-- course the block belongs to.
create policy "lesson_blocks: enrolled Students read"
on public.lesson_blocks for select
to authenticated
using (
  exists (
    select 1
    from public.lessons l
    join public.sections s on s.id = l.section_id
    join public.enrollments e on e.course_id = s.course_id
    where l.id = lesson_blocks.lesson_id
      and e.user_id = (select auth.uid())
      and e.status = 'active'
      and (e.expires_at is null or e.expires_at > now())
  )
);

-- Admin read. Admin writes go through server code that also writes audit_log
-- (phase 5).
create policy "report_attempts: admin reads"
on public.report_attempts for select
to authenticated
using ((select public.is_admin()));

create policy "tickets: admin reads"
on public.tickets for select
to authenticated
using ((select public.is_admin()));

create policy "audit_log: admin reads"
on public.audit_log for select
to authenticated
using ((select public.is_admin()));

-- ---------------------------------------------------------------------------
-- updated_at on every table, through the shared trigger function
-- ---------------------------------------------------------------------------

do $$
declare
  t text;
begin
  foreach t in array array[
    'states', 'state_waitlist', 'courts', 'courses', 'sections', 'lessons',
    'lesson_blocks', 'questions', 'answer_options', 'orders', 'enrollments',
    'lesson_progress', 'quiz_attempts', 'exam_attempts', 'identity_checks',
    'security_questions', 'certificates', 'completion_reports',
    'report_attempts', 'refunds', 'stripe_events', 'faq_items', 'pages',
    'posts', 'changelog', 'reviews', 'ai_conversations', 'ai_messages',
    'kb_chunks', 'tickets', 'audit_log'
  ]
  loop
    execute format(
      'create trigger %I before update on public.%I '
      'for each row execute function public.set_updated_at()',
      t || '_set_updated_at', t
    );
  end loop;
end;
$$;
