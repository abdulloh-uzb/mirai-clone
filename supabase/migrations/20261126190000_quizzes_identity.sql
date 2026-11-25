-- Ticket 04: section quizzes (server graded) and identity checks.

-- A section is open when every lesson of every earlier section is completed
-- and a passed quiz attempt exists for each earlier section.
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
    where e.id = p_enrollment_id
      and (
        exists (
          select 1 from public.lessons l
          left join public.lesson_progress lp
            on lp.lesson_id = l.id and lp.enrollment_id = e.id and lp.completed_at is not null
          where l.section_id = s.id and lp.id is null
        )
        or not exists (
          select 1 from public.quiz_attempts qa
          where qa.enrollment_id = e.id and qa.section_id = s.id and qa.passed
        )
      )
  );
$$;

create or replace function public.section_quiz_passed(p_enrollment_id uuid, p_section_position integer)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.enrollments e
    join public.sections s on s.course_id = e.course_id and s.position = p_section_position
    join public.quiz_attempts qa on qa.section_id = s.id and qa.enrollment_id = e.id
    where e.id = p_enrollment_id and e.user_id = (select auth.uid()) and qa.passed
  );
$$;

revoke execute on function public.section_quiz_passed(uuid, integer) from public, anon;
grant execute on function public.section_quiz_passed(uuid, integer) to authenticated;

-- The question set as the browser may see it: no correctness, no explanation.
create or replace function public.quiz_attempt_payload(p_attempt_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'attemptId', qa.id,
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
        order by array_position(qa.question_ids, q.id)
      )
      from public.questions q where q.id = any (qa.question_ids)
    ), '[]'::jsonb)
  )
  from public.quiz_attempts qa where qa.id = p_attempt_id;
$$;

revoke execute on function public.quiz_attempt_payload(uuid) from public, anon, authenticated;

-- TODO(spec): 3 to 5 identity checks per course; 4 asked, after 3, 9, 15 and
-- 21 completed lessons. Returns null when nothing is due.
create or replace function public.identity_check_due(p_enrollment_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  done integer;
  milestones integer;
  answered integer;
  asked integer;
  keys text[] := array['dob', 'license_no_last4', 'security_question'];
  key text;
begin
  if not exists (
    select 1 from public.enrollments where id = p_enrollment_id and user_id = (select auth.uid())
  ) then
    raise exception 'enrollment_not_found' using errcode = '42501';
  end if;
  select count(*) into done from public.lesson_progress
  where enrollment_id = p_enrollment_id and completed_at is not null;
  milestones := (done >= 3)::int + (done >= 9)::int + (done >= 15)::int + (done >= 21)::int;
  select count(*) filter (where correct), count(*) into answered, asked
  from public.identity_checks where enrollment_id = p_enrollment_id;
  if answered >= milestones then
    return null;
  end if;
  key := keys[1 + (asked % 3)];
  if key = 'security_question' and not exists (
    select 1 from public.security_questions sq
    join public.enrollments e on e.user_id = sq.user_id where e.id = p_enrollment_id
  ) then
    key := 'dob';
  end if;
  return jsonb_build_object(
    'questionKey', key,
    'prompt', case when key = 'security_question'
      then (select sq.question from public.security_questions sq
            join public.enrollments e on e.user_id = sq.user_id where e.id = p_enrollment_id limit 1)
      else key end
  );
end;
$$;

create or replace function public.answer_identity_check(
  p_enrollment_id uuid,
  p_question_key text,
  p_answer text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v public.enrollments;
  due jsonb;
  prof public.profiles;
  ans text := lower(trim(coalesce(p_answer, '')));
  ok boolean := false;
  prev_correct boolean;
  paused boolean := false;
begin
  v := public.assert_enrollment_usable(p_enrollment_id);
  due := public.identity_check_due(p_enrollment_id);
  if due is null or due ->> 'questionKey' <> p_question_key then
    raise exception 'no_identity_check_due' using errcode = '22023';
  end if;
  select * into prof from public.profiles where user_id = v.user_id;

  if p_question_key = 'dob' then
    ok := prof.dob is not null and ans = to_char(prof.dob, 'YYYY-MM-DD');
  elsif p_question_key = 'license_no_last4' then
    ok := prof.license_no is not null and length(ans) = 4
      and ans = lower(right(prof.license_no, 4));
  else
    ok := exists (
      select 1 from public.security_questions sq
      where sq.user_id = v.user_id and sq.answer_hash = extensions.crypt(ans, sq.answer_hash)
    );
  end if;

  select correct into prev_correct from public.identity_checks
  where enrollment_id = p_enrollment_id order by asked_at desc, created_at desc limit 1;

  insert into public.identity_checks (enrollment_id, question_key, correct)
  values (p_enrollment_id, p_question_key, ok);

  if not ok and prev_correct is not null and not prev_correct then
    update public.enrollments set status = 'paused' where id = p_enrollment_id;
    paused := true;
  end if;
  return jsonb_build_object('correct', ok, 'paused', paused);
end;
$$;

revoke execute on function public.identity_check_due(uuid) from public, anon;
revoke execute on function public.answer_identity_check(uuid, text, text) from public, anon;
grant execute on function public.identity_check_due(uuid) to authenticated;
grant execute on function public.answer_identity_check(uuid, text, text) to authenticated;

-- Quizzes

create or replace function public.start_quiz(p_enrollment_id uuid, p_section_position integer)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v public.enrollments;
  sec_id uuid;
  attempt_id uuid;
  picked uuid[];
begin
  v := public.assert_enrollment_usable(p_enrollment_id);
  select id into sec_id from public.sections
  where course_id = v.course_id and position = p_section_position;
  if sec_id is null then
    raise exception 'section_not_found' using errcode = '42501';
  end if;
  if not public.section_unlocked(p_enrollment_id, p_section_position) then
    raise exception 'section_locked' using errcode = '42501';
  end if;
  if exists (
    select 1 from public.lessons l
    left join public.lesson_progress lp
      on lp.lesson_id = l.id and lp.enrollment_id = p_enrollment_id and lp.completed_at is not null
    where l.section_id = sec_id and lp.id is null
  ) then
    raise exception 'lessons_incomplete' using errcode = '42501';
  end if;
  if public.identity_check_due(p_enrollment_id) is not null then
    raise exception 'identity_check_required' using errcode = '42501';
  end if;

  select id into attempt_id from public.quiz_attempts
  where enrollment_id = p_enrollment_id and section_id = sec_id and submitted_at is null
  order by started_at desc limit 1;

  if attempt_id is null then
    -- TODO(spec): 5 to 10 questions per quiz; 8 picked.
    select coalesce(array_agg(id), '{}') into picked from (
      select id from public.questions
      where section_id = sec_id and locale = v.course_locale
      order by random() limit 8
    ) p;
    if coalesce(array_length(picked, 1), 0) = 0 then
      raise exception 'no_questions' using errcode = '22023';
    end if;
    insert into public.quiz_attempts (enrollment_id, section_id, question_ids)
    values (p_enrollment_id, sec_id, picked)
    returning id into attempt_id;
  end if;

  return public.quiz_attempt_payload(attempt_id);
end;
$$;

create or replace function public.submit_quiz(p_attempt_id uuid, p_answers jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  a public.quiz_attempts;
  v public.enrollments;
  pct integer;
  total integer;
  right_count integer;
  ok boolean;
  results jsonb;
begin
  select * into a from public.quiz_attempts where id = p_attempt_id for update;
  if not found or not exists (
    select 1 from public.enrollments where id = a.enrollment_id and user_id = (select auth.uid())
  ) then
    raise exception 'attempt_not_found' using errcode = '42501';
  end if;
  if a.submitted_at is not null then
    raise exception 'already_submitted' using errcode = '42501';
  end if;
  v := public.assert_enrollment_usable(a.enrollment_id);
  select st.pass_pct into pct
  from public.courses c join public.states st on st.code = c.state_code
  where c.id = v.course_id;

  total := array_length(a.question_ids, 1);
  p_answers := coalesce(p_answers, '{}'::jsonb);

  select coalesce(jsonb_agg(r.res order by r.ord), '[]'::jsonb),
         count(*) filter (where (r.res ->> 'correct')::boolean)
  into results, right_count
  from (
    select array_position(a.question_ids, q.id) as ord,
      jsonb_build_object(
        'questionId', q.id,
        'chosenOptionId', chosen.id,
        'correctOptionId', (select o.id from public.answer_options o where o.question_id = q.id and o.is_correct limit 1),
        'correct', coalesce(chosen.is_correct, false),
        'explanation', q.explanation
      ) as res
    from public.questions q
    left join lateral (
      select o.id, o.is_correct from public.answer_options o
      where o.question_id = q.id and o.id::text = p_answers ->> q.id::text
    ) chosen on true
    where q.id = any (a.question_ids)
  ) r;

  ok := right_count * 100 >= total * pct;
  update public.quiz_attempts
  set answers = p_answers, score = right_count, passed = ok, submitted_at = now()
  where id = a.id;

  return jsonb_build_object('score', right_count, 'total', total, 'passed', ok, 'results', results);
end;
$$;

revoke execute on function public.start_quiz(uuid, integer) from public, anon;
revoke execute on function public.submit_quiz(uuid, jsonb) from public, anon;
grant execute on function public.start_quiz(uuid, integer) to authenticated;
grant execute on function public.submit_quiz(uuid, jsonb) to authenticated;

-- Progress is blocked while an identity check is due. Bodies are those of
-- ticket 03 plus the guard.

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
  if public.identity_check_due(p_enrollment_id) is not null then
    raise exception 'identity_check_required' using errcode = '42501';
  end if;
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
  if public.identity_check_due(p_enrollment_id) is not null then
    raise exception 'identity_check_required' using errcode = '42501';
  end if;
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
