-- Admin dashboard (ADR 0005): Student stages, the Needs attention list and the
-- 30-day activity chart. Admin RPCs are security definer with an is_admin() check.

create type public.student_stage as enum
  ('registered', 'studying', 'needs_attention', 'completed', 'reported');

-- The one place the Student stage rule lives (GLOSSARY.md, "Student stages").
-- Input is the Student's most recent enrollment; all null when there is none.
create or replace function public.enrollment_stage(
  p_status text default null,
  p_expires_at timestamptz default null,
  p_report_accepted boolean default false
)
returns public.student_stage
language sql
stable
set search_path = ''
as $$
  select (case
    when p_status is null or p_status = 'refunded' then 'registered'
    when p_status in ('paused', 'locked', 'expired') then 'needs_attention'
    when p_status = 'completed' and coalesce(p_report_accepted, false) then 'reported'
    when p_status = 'completed' then 'completed'
    -- Out of access time; the flip to 'expired' happens lazily.
    when p_expires_at is not null and p_expires_at <= now() then 'needs_attention'
    else 'studying'
  end)::public.student_stage;
$$;

revoke execute on function public.enrollment_stage(text, timestamptz, boolean) from public, anon;
grant execute on function public.enrollment_stage(text, timestamptz, boolean) to authenticated;

-- Every Student (role student) with the stage of their most recent enrollment.
create or replace function public.admin_student_stages()
returns table (user_id uuid, stage public.student_stage, enrollment_id uuid)
language plpgsql
stable
security definer
set search_path = ''
as $$
#variable_conflict use_column
begin
  if not public.is_admin() then
    raise exception 'admin only' using errcode = '42501';
  end if;

  return query
  select p.user_id,
         public.enrollment_stage(le.status, le.expires_at, le.report_accepted),
         le.id
  from public.profiles p
  left join lateral (
    select e.id, e.status, e.expires_at,
           exists (
             select 1
             from public.certificates c
             join public.completion_reports r on r.certificate_id = c.id
             where c.enrollment_id = e.id and r.status = 'accepted'
           ) as report_accepted
    from public.enrollments e
    where e.user_id = p.user_id
    order by e.created_at desc, e.id desc
    limit 1
  ) le on true
  where p.role = 'student';
end;
$$;

revoke execute on function public.admin_student_stages() from public, anon;
grant execute on function public.admin_student_stages() to authenticated;

-- Five rows, one per stage in enum order, zero when empty.
create or replace function public.admin_stage_counts()
returns table (stage public.student_stage, students bigint)
language plpgsql
stable
security definer
set search_path = ''
as $$
#variable_conflict use_column
begin
  if not public.is_admin() then
    raise exception 'admin only' using errcode = '42501';
  end if;

  return query
  select st.stage, count(s.user_id)::bigint
  from unnest(enum_range(null::public.student_stage)) as st(stage)
  left join public.admin_student_stages() s on s.stage = st.stage
  group by st.stage
  order by st.stage;
end;
$$;

revoke execute on function public.admin_stage_counts() from public, anon;
grant execute on function public.admin_stage_counts() to authenticated;

-- Student search gains a stage filter and returns each Student's stage.
-- The input is `stage_filter`: an IN parameter may not share the name of the `stage` output column.
drop function public.admin_search_students(text, integer, integer);

create function public.admin_search_students(
  q text,
  stage_filter public.student_stage default null,
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
  created_at timestamptz,
  stage public.student_stage
)
language plpgsql
stable
security definer
set search_path = ''
as $$
#variable_conflict use_column
declare
  pattern text := '%' || replace(replace(replace(trim(coalesce(q, '')), '\', '\\'), '%', '\%'), '_', '\_') || '%';
begin
  if not public.is_admin() then
    raise exception 'admin only' using errcode = '42501';
  end if;

  return query
  select p.user_id, u.email::text, p.first_name, p.last_name, p.legal_name,
         p.license_no, p.created_at, s.stage
  from public.profiles p
  join auth.users u on u.id = p.user_id
  join public.admin_student_stages() s on s.user_id = p.user_id
  where p.role = 'student'
    and (stage_filter is null or s.stage = stage_filter)
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

revoke execute on function public.admin_search_students(text, public.student_stage, integer, integer) from public, anon;
grant execute on function public.admin_search_students(text, public.student_stage, integer, integer) to authenticated;

-- Sales (paid and partially refunded orders) and new enrollments per school day
-- (America/Los_Angeles), oldest first, with missing days as 0.
create or replace function public.admin_daily_activity(p_days integer default 30)
returns table (day date, sales_cents bigint, enrollments bigint)
language plpgsql
stable
security definer
set search_path = ''
as $$
#variable_conflict use_column
declare
  v_days integer := greatest(1, least(coalesce(p_days, 30), 90));
  v_today date := (now() at time zone 'America/Los_Angeles')::date;
begin
  if not public.is_admin() then
    raise exception 'admin only' using errcode = '42501';
  end if;

  return query
  select d.day::date,
         coalesce((
           select sum(o.amount_cents) from public.orders o
           where o.status in ('paid', 'partially_refunded')
             and (o.created_at at time zone 'America/Los_Angeles')::date = d.day::date
         ), 0)::bigint,
         (
           select count(*) from public.enrollments e
           where (e.created_at at time zone 'America/Los_Angeles')::date = d.day::date
         )::bigint
  from generate_series(v_today - (v_days - 1), v_today, interval '1 day') as d(day)
  order by d.day;
end;
$$;

revoke execute on function public.admin_daily_activity(integer) from public, anon;
grant execute on function public.admin_daily_activity(integer) to authenticated;

-- Things only an Admin can fix, oldest first, at most p_limit per kind, with
-- the total per kind. `detail` is the report status, refund status, enrollment
-- status ('expired' for an overdue active one), ticket type, or enrollment status.
create or replace function public.admin_attention_items(p_limit integer default 5)
returns table (
  kind text,
  ref_id uuid,
  user_id uuid,
  user_name text,
  user_email text,
  detail text,
  amount_cents integer,
  due_date date,
  since timestamptz,
  total bigint
)
language plpgsql
stable
security definer
set search_path = ''
as $$
#variable_conflict use_column
declare
  v_limit integer := greatest(1, least(coalesce(p_limit, 5), 50));
  v_today date := (now() at time zone 'America/Los_Angeles')::date;
begin
  if not public.is_admin() then
    raise exception 'admin only' using errcode = '42501';
  end if;

  return query
  with items as (
    select 'report_failed'::text as kind, r.id as ref_id, e.user_id as user_id,
           r.status as detail, null::integer as amount_cents, null::date as due_date,
           coalesce(r.rejected_at, r.updated_at) as since
    from public.completion_reports r
    join public.certificates c on c.id = r.certificate_id
    join public.enrollments e on e.id = c.enrollment_id
    where r.status in ('rejected', 'error')
    union all
    select 'refund_requested', f.order_id, o.user_id, f.status, f.amount_cents, null, f.created_at
    from public.refunds f
    join public.orders o on o.id = f.order_id
    where f.status = 'requested'
    union all
    select 'enrollment_blocked', e.id, e.user_id,
           case when e.status = 'active' then 'expired' else e.status end,
           null, null, e.updated_at
    from public.enrollments e
    where public.enrollment_stage(e.status, e.expires_at, false) = 'needs_attention'
    union all
    select 'ticket_open', t.id, t.user_id, t.type, null, null, t.created_at
    from public.tickets t
    where t.status in ('open', 'in_progress')
    union all
    select 'court_due_soon', e.id, e.user_id, e.status, null, e.court_due_date,
           e.court_due_date::timestamptz
    from public.enrollments e
    where e.court_due_date is not null
      and e.court_due_date <= v_today + 7
      and public.enrollment_stage(e.status, e.expires_at, false) in ('studying', 'needs_attention')
  ),
  ranked as (
    select i.*,
           row_number() over (partition by i.kind order by i.since, i.ref_id) as rn,
           count(*) over (partition by i.kind) as total
    from items i
  )
  select x.kind, x.ref_id, x.user_id,
         nullif(trim(coalesce(p.first_name, '') || ' ' || coalesce(p.last_name, '')), ''),
         coalesce(u.email::text, tk.email),
         x.detail, x.amount_cents, x.due_date, x.since, x.total
  from ranked x
  left join public.profiles p on p.user_id = x.user_id
  left join auth.users u on u.id = x.user_id
  left join public.tickets tk on x.kind = 'ticket_open' and tk.id = x.ref_id
  where x.rn <= v_limit
  order by x.kind, x.rn;
end;
$$;

revoke execute on function public.admin_attention_items(integer) from public, anon;
grant execute on function public.admin_attention_items(integer) to authenticated;
