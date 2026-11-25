-- Ticket 03: lesson progress with server-side minimum time and ordering.

alter table public.lesson_progress
  add column last_heartbeat_at timestamptz,
  add column last_block_position integer not null default 0;

-- Single place that decides whether a section is open. Ticket 04 redefines it
-- to also require the earlier section's quiz to be passed.
create or replace function public.section_unlocked(p_enrollment_id uuid, p_section_position integer)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select p_section_position <= 1 or not exists (
    select 1
    from public.enrollments e
    join public.sections s on s.course_id = e.course_id and s.position < p_section_position
    join public.lessons l on l.section_id = s.id
    left join public.lesson_progress lp
      on lp.lesson_id = l.id and lp.enrollment_id = e.id and lp.completed_at is not null
    where e.id = p_enrollment_id and lp.id is null
  );
$$;

create or replace function public.lesson_unlocked(p_enrollment_id uuid, p_lesson_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.lessons l
    join public.sections s on s.id = l.section_id
    where l.id = p_lesson_id
      and public.section_unlocked(p_enrollment_id, s.position)
      and not exists (
        select 1
        from public.lessons earlier
        left join public.lesson_progress lp
          on lp.lesson_id = earlier.id and lp.enrollment_id = p_enrollment_id
          and lp.completed_at is not null
        where earlier.section_id = l.section_id
          and earlier.position < l.position
          and lp.id is null
      )
  );
$$;

revoke execute on function public.section_unlocked(uuid, integer) from public, anon;
revoke execute on function public.lesson_unlocked(uuid, uuid) from public, anon;
grant execute on function public.section_unlocked(uuid, integer) to authenticated;
grant execute on function public.lesson_unlocked(uuid, uuid) to authenticated;

-- Internal helper: the caller's own, active, unexpired enrollment with details.
create or replace function public.assert_enrollment_usable(p_enrollment_id uuid)
returns public.enrollments
language plpgsql
security definer
set search_path = ''
as $$
declare
  v public.enrollments;
begin
  select * into v from public.enrollments
  where id = p_enrollment_id and user_id = (select auth.uid())
  for update;
  if not found then
    raise exception 'enrollment_not_found' using errcode = '42501';
  end if;
  -- A raise rolls the transaction back, so the status flip itself is done by
  -- expire_enrollment_if_due, which server code calls after this error.
  if v.status = 'active' and v.expires_at is not null and v.expires_at < now() then
    raise exception 'enrollment_expired' using errcode = '42501';
  end if;
  if v.status = 'expired' then
    raise exception 'enrollment_expired' using errcode = '42501';
  end if;
  if v.status <> 'active' then
    raise exception 'enrollment_not_active' using errcode = '42501';
  end if;
  if not public.has_driver_details(p_enrollment_id) then
    raise exception 'details_required' using errcode = '42501';
  end if;
  return v;
end;
$$;

revoke execute on function public.assert_enrollment_usable(uuid) from public, anon, authenticated;

-- Marks the caller's own overdue enrollment expired. Returns true if it did.
create or replace function public.expire_enrollment_if_due(p_enrollment_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  hit integer;
begin
  update public.enrollments
  set status = 'expired'
  where id = p_enrollment_id
    and user_id = (select auth.uid())
    and status = 'active'
    and expires_at is not null
    and expires_at < now();
  get diagnostics hit = row_count;
  return hit > 0;
end;
$$;

revoke execute on function public.expire_enrollment_if_due(uuid) from public, anon;
grant execute on function public.expire_enrollment_if_due(uuid) to authenticated;

create or replace function public.record_lesson_time(
  p_enrollment_id uuid,
  p_lesson_id uuid,
  p_seconds integer,
  p_block_position integer
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v public.enrollments;
  prev public.lesson_progress;
  credit integer;
  total integer;
begin
  v := public.assert_enrollment_usable(p_enrollment_id);
  if not exists (
    select 1 from public.lessons l join public.sections s on s.id = l.section_id
    where l.id = p_lesson_id and s.course_id = v.course_id
  ) then
    raise exception 'lesson_not_found' using errcode = '42501';
  end if;
  if not public.lesson_unlocked(p_enrollment_id, p_lesson_id) then
    raise exception 'lesson_locked' using errcode = '42501';
  end if;

  if v.started_at is null then
    update public.enrollments set started_at = now() where id = v.id;
  end if;

  select * into prev from public.lesson_progress
  where enrollment_id = p_enrollment_id and lesson_id = p_lesson_id;

  credit := greatest(0, least(
    coalesce(p_seconds, 0),
    30,
    extract(epoch from now() - coalesce(prev.last_heartbeat_at, now() - interval '30 seconds'))::integer + 5
  ));

  insert into public.lesson_progress as lp
    (enrollment_id, lesson_id, seconds_spent, last_heartbeat_at, last_block_position)
  values
    (p_enrollment_id, p_lesson_id, credit, now(), greatest(0, coalesce(p_block_position, 0)))
  on conflict (enrollment_id, lesson_id) do update
  set seconds_spent = lp.seconds_spent + credit,
      last_heartbeat_at = now(),
      last_block_position = greatest(lp.last_block_position, excluded.last_block_position)
  returning lp.seconds_spent into total;

  return total;
end;
$$;

create or replace function public.complete_lesson(p_enrollment_id uuid, p_lesson_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v public.enrollments;
  spent integer;
  needed integer;
begin
  v := public.assert_enrollment_usable(p_enrollment_id);
  if not public.lesson_unlocked(p_enrollment_id, p_lesson_id) then
    raise exception 'lesson_locked' using errcode = '42501';
  end if;
  select min_seconds into needed from public.lessons where id = p_lesson_id;
  select seconds_spent into spent from public.lesson_progress
  where enrollment_id = p_enrollment_id and lesson_id = p_lesson_id;
  if coalesce(spent, 0) < coalesce(needed, 0) then
    raise exception 'min_time_not_met' using errcode = '22023';
  end if;
  insert into public.lesson_progress (enrollment_id, lesson_id, seconds_spent, completed_at)
  values (p_enrollment_id, p_lesson_id, coalesce(spent, 0), now())
  on conflict (enrollment_id, lesson_id) do update
  set completed_at = coalesce(public.lesson_progress.completed_at, now());
end;
$$;

revoke execute on function public.record_lesson_time(uuid, uuid, integer, integer) from public, anon;
revoke execute on function public.complete_lesson(uuid, uuid) from public, anon;
grant execute on function public.record_lesson_time(uuid, uuid, integer, integer) to authenticated;
grant execute on function public.complete_lesson(uuid, uuid) to authenticated;
