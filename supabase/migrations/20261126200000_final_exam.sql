-- Ticket 05: final exam (server graded, one active session, details lock on start).

alter table public.exam_attempts
  add column attempt_no integer not null default 1,
  add column expires_at timestamptz;

-- Admin resets (ticket 10) raise the allowed attempts: allowed = max_attempts * (1 + exam_resets).
alter table public.enrollments
  add column exam_resets integer not null default 0 check (exam_resets >= 0);

create or replace function public.exam_eligibility(p_enrollment_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  e public.enrollments;
  st public.states;
  reasons text[] := '{}';
  used integer;
  allowed integer;
  spent integer;
  active_id uuid;
  latest jsonb;
begin
  select * into e from public.enrollments where id = p_enrollment_id;
  if not found or (e.user_id <> (select auth.uid()) and not public.is_admin()) then
    raise exception 'enrollment_not_found' using errcode = '42501';
  end if;
  select s.* into st from public.courses c join public.states s on s.code = c.state_code
  where c.id = e.course_id;

  select count(*) into used from public.exam_attempts where enrollment_id = e.id;
  allowed := st.max_attempts * (1 + e.exam_resets);
  select id into active_id from public.exam_attempts
  where enrollment_id = e.id and submitted_at is null and expires_at > now()
  order by started_at desc limit 1;
  select coalesce(sum(seconds_spent), 0)::integer into spent
  from public.lesson_progress where enrollment_id = e.id;

  select jsonb_build_object('attemptId', ea.id, 'attemptNo', ea.attempt_no, 'score', ea.score,
    'total', array_length(ea.question_ids, 1), 'passed', ea.passed)
  into latest from public.exam_attempts ea
  where ea.enrollment_id = e.id and ea.submitted_at is not null
  order by ea.attempt_no desc limit 1;

  if e.status = 'completed' then
    reasons := array_append(reasons, 'already_passed');
  elsif e.status <> 'active' or (e.expires_at is not null and e.expires_at < now()) then
    reasons := array_append(reasons, 'not_active');
  elsif active_id is null then
    if exists (
      select 1 from public.sections s
      where s.course_id = e.course_id and not exists (
        select 1 from public.quiz_attempts qa
        where qa.enrollment_id = e.id and qa.section_id = s.id and qa.passed)
    ) then
      reasons := array_append(reasons, 'sections_incomplete');
    end if;
    if spent < st.min_course_minutes * 60 then
      reasons := array_append(reasons, 'min_time');
    end if;
    if not public.has_driver_details(e.id) then
      reasons := array_append(reasons, 'details_required');
    end if;
    if used >= allowed then
      reasons := array_append(reasons, 'no_attempts_left');
    end if;
  end if;

  return jsonb_build_object(
    'eligible', coalesce(array_length(reasons, 1), 0) = 0,
    'reasons', to_jsonb(reasons),
    'attemptsUsed', used,
    'attemptsAllowed', allowed,
    'minutesSpent', spent / 60,
    'minutesRequired', st.min_course_minutes,
    'passed', e.status = 'completed',
    'activeAttemptId', active_id,
    'latest', latest
  );
end;
$$;

-- The exam as the browser may see it: no correctness, no explanation.
create or replace function public.exam_attempt_payload(p_attempt_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'attemptId', ea.id,
    'attemptNo', ea.attempt_no,
    'expiresAt', ea.expires_at,
    'answers', ea.answers,
    'questions', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', q.id,
          'text', q.text,
          'options', (
            select coalesce(jsonb_agg(jsonb_build_object('id', o.id, 'text', o.text) order by random()), '[]'::jsonb)
            from public.answer_options o where o.question_id = q.id
          )
        )
        order by array_position(ea.question_ids, q.id)
      )
      from public.questions q where q.id = any (ea.question_ids)
    ), '[]'::jsonb)
  )
  from public.exam_attempts ea where ea.id = p_attempt_id;
$$;

revoke execute on function public.exam_attempt_payload(uuid) from public, anon, authenticated;

-- Grades an attempt from its saved answers and applies the outcome. The one
-- place where a pass or a lock happens.
create or replace function public.grade_exam_attempt(p_attempt_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  a public.exam_attempts;
  e public.enrollments;
  pct integer;
  max_att integer;
  total integer;
  right_count integer;
  ok boolean;
  left_count integer;
begin
  select * into a from public.exam_attempts where id = p_attempt_id for update;
  select * into e from public.enrollments where id = a.enrollment_id;
  select s.pass_pct, s.max_attempts into pct, max_att
  from public.courses c join public.states s on s.code = c.state_code where c.id = e.course_id;

  total := array_length(a.question_ids, 1);
  select count(*) into right_count
  from public.answer_options o
  where o.is_correct and o.question_id = any (a.question_ids)
    and o.id::text = a.answers ->> o.question_id::text;

  ok := right_count * 100 >= total * pct;
  update public.exam_attempts
  set score = right_count, passed = ok, submitted_at = now()
  where id = a.id;

  left_count := greatest(0, max_att * (1 + e.exam_resets)
    - (select count(*) from public.exam_attempts where enrollment_id = e.id));

  -- ticket 08: certificate issued by server code after submit_exam returns passed
  if ok then
    update public.enrollments set status = 'completed', completed_at = now()
    where id = e.id and status = 'active';
  elsif left_count = 0 then
    update public.enrollments set status = 'locked' where id = e.id and status = 'active';
  end if;

  return jsonb_build_object('score', right_count, 'total', total, 'passed', ok, 'attemptsLeft', left_count);
end;
$$;

revoke execute on function public.grade_exam_attempt(uuid) from public, anon, authenticated;

create or replace function public.start_exam(p_enrollment_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v public.enrollments;
  elig jsonb;
  active public.exam_attempts;
  used uuid[];
  picked uuid[];
  attempt_id uuid;
  n integer;
begin
  v := public.assert_enrollment_usable(p_enrollment_id);

  select * into active from public.exam_attempts
  where enrollment_id = p_enrollment_id and submitted_at is null
  order by started_at desc limit 1;
  if found then
    if active.expires_at > now() then
      return public.exam_attempt_payload(active.id);
    end if;
    -- Time ran out: grade what was saved. Outcomes that end the course are
    -- returned instead of raised so the grading is kept.
    elig := public.grade_exam_attempt(active.id);
    if (elig ->> 'passed')::boolean or (elig ->> 'attemptsLeft')::integer = 0 then
      return elig || jsonb_build_object('autoSubmitted', true);
    end if;
  end if;

  elig := public.exam_eligibility(p_enrollment_id);
  if not (elig ->> 'eligible')::boolean then
    raise exception '%', elig -> 'reasons' ->> 0 using errcode = '42501';
  end if;

  perform public.lock_driver_details(v.user_id);

  select s.exam_questions into n
  from public.courses c join public.states s on s.code = c.state_code where c.id = v.course_id;
  select coalesce(array_agg(qid), '{}') into used
  from public.exam_attempts ea, unnest(ea.question_ids) as qid
  where ea.enrollment_id = p_enrollment_id;

  -- Prefer questions not used in earlier attempts; fill from used ones if the pool is short.
  select coalesce(array_agg(id), '{}') into picked from (
    select id from public.questions
    where section_id is null and locale = v.course_locale
    order by (id = any (used)), random()
    limit n
  ) p;
  if coalesce(array_length(picked, 1), 0) = 0 then
    raise exception 'no_questions' using errcode = '22023';
  end if;

  -- TODO(spec): the time limit is not in the spec; 60 minutes.
  insert into public.exam_attempts (enrollment_id, question_ids, attempt_no, expires_at)
  values (
    p_enrollment_id, picked,
    (select count(*) + 1 from public.exam_attempts where enrollment_id = p_enrollment_id),
    now() + interval '60 minutes'
  )
  returning id into attempt_id;

  return public.exam_attempt_payload(attempt_id);
end;
$$;

create or replace function public.save_exam_answer(p_attempt_id uuid, p_question_id uuid, p_option_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  a public.exam_attempts;
begin
  select * into a from public.exam_attempts where id = p_attempt_id for update;
  if not found or not exists (
    select 1 from public.enrollments where id = a.enrollment_id and user_id = (select auth.uid())
  ) then
    raise exception 'attempt_not_found' using errcode = '42501';
  end if;
  if a.submitted_at is not null then
    raise exception 'already_submitted' using errcode = '42501';
  end if;
  if a.expires_at <= now() then
    raise exception 'exam_expired' using errcode = '42501';
  end if;
  if not (p_question_id = any (a.question_ids)) or not exists (
    select 1 from public.answer_options where id = p_option_id and question_id = p_question_id
  ) then
    raise exception 'invalid_answer' using errcode = '22023';
  end if;
  update public.exam_attempts
  set answers = answers || jsonb_build_object(p_question_id::text, p_option_id)
  where id = a.id;
end;
$$;

create or replace function public.submit_exam(p_attempt_id uuid, p_answers jsonb default null)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  a public.exam_attempts;
begin
  select * into a from public.exam_attempts where id = p_attempt_id for update;
  if not found or not exists (
    select 1 from public.enrollments where id = a.enrollment_id and user_id = (select auth.uid())
  ) then
    raise exception 'attempt_not_found' using errcode = '42501';
  end if;
  if a.submitted_at is not null then
    raise exception 'already_submitted' using errcode = '42501';
  end if;
  if p_answers is not null and a.expires_at > now() then
    update public.exam_attempts set answers = answers || p_answers where id = a.id;
  end if;
  return public.grade_exam_attempt(a.id);
end;
$$;

create or replace function public.exam_review(p_attempt_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  a public.exam_attempts;
begin
  select * into a from public.exam_attempts where id = p_attempt_id;
  if not found or not exists (
    select 1 from public.enrollments where id = a.enrollment_id and user_id = (select auth.uid())
  ) then
    raise exception 'attempt_not_found' using errcode = '42501';
  end if;
  if a.passed is not true then
    raise exception 'review_not_allowed' using errcode = '42501';
  end if;
  return jsonb_build_object(
    'score', a.score,
    'total', array_length(a.question_ids, 1),
    'questions', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'id', q.id,
        'text', q.text,
        'explanation', q.explanation,
        'chosenOptionId', a.answers ->> q.id::text,
        'options', (select jsonb_agg(jsonb_build_object('id', o.id, 'text', o.text, 'correct', o.is_correct))
                    from public.answer_options o where o.question_id = q.id)
      ) order by array_position(a.question_ids, q.id)), '[]'::jsonb)
      from public.questions q where q.id = any (a.question_ids)
    )
  );
end;
$$;

revoke execute on function public.exam_eligibility(uuid) from public, anon;
revoke execute on function public.start_exam(uuid) from public, anon;
revoke execute on function public.save_exam_answer(uuid, uuid, uuid) from public, anon;
revoke execute on function public.submit_exam(uuid, jsonb) from public, anon;
revoke execute on function public.exam_review(uuid) from public, anon;
grant execute on function public.exam_eligibility(uuid) to authenticated;
grant execute on function public.start_exam(uuid) to authenticated;
grant execute on function public.save_exam_answer(uuid, uuid, uuid) to authenticated;
grant execute on function public.submit_exam(uuid, jsonb) to authenticated;
grant execute on function public.exam_review(uuid) to authenticated;
