-- Ticket 02: driver/court details, validation, the details lock and the admin override.

create extension if not exists pgcrypto with schema extensions;

alter table public.enrollments
  add column county_id uuid references public.counties (id) on delete restrict;
create index enrollments_county_id_idx on public.enrollments (county_id);

alter table public.security_questions
  add constraint security_questions_user_id_key unique (user_id),
  add constraint security_questions_question_check check (
    question in ('first_car', 'birth_city', 'first_school', 'favorite_teacher', 'childhood_street')
  );

-- Validation on every path (PostgREST, RPC, server code).
create or replace function public.validate_profile_details()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.dob is not null then
    if new.dob < date '1901-01-01' then
      raise exception 'dob is not a real date of birth' using errcode = '23514';
    end if;
    if age(current_date, new.dob) < interval '15 years'
      or age(current_date, new.dob) >= interval '101 years' then
      raise exception 'dob must be an age between 15 and 100' using errcode = '23514';
    end if;
  end if;
  if new.license_state is not null and new.license_state !~ '^[A-Z]{2}$' then
    raise exception 'license_state must be two capital letters' using errcode = '23514';
  end if;
  if new.license_state = 'CA' and new.license_no is not null
    and new.license_no !~ '^[A-Z][0-9]{7}$' then
    raise exception 'license_no must be one letter and seven digits' using errcode = '23514';
  end if;
  if new.phone is not null and new.phone !~ '^\+?[0-9 ()-]{7,20}$' then
    raise exception 'phone is not valid' using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger profiles_validate_details
before insert or update on public.profiles
for each row execute function public.validate_profile_details();

-- Same as before, plus the details lock. Admins must use the override function.
create or replace function public.guard_profile_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user not in ('anon', 'authenticated') then
    return new;
  end if;

  if new.user_id is distinct from old.user_id then
    raise exception 'profiles.user_id cannot be changed'
      using errcode = '42501';
  end if;

  if old.details_locked_at is not null
    and coalesce(current_setting('app.details_override', true), '') <> 'on'
    and (new.legal_name is distinct from old.legal_name
      or new.dob is distinct from old.dob
      or new.license_no is distinct from old.license_no) then
    raise exception 'details are locked' using errcode = '42501';
  end if;

  if public.is_admin() then
    return new;
  end if;

  if new.role is distinct from old.role then
    raise exception 'only an admin can change a role'
      using errcode = '42501';
  end if;

  if new.email_verified_at is distinct from old.email_verified_at
    or new.details_locked_at is distinct from old.details_locked_at then
    raise exception 'this field is set by the server only'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

create or replace function public.save_driver_details(
  p_enrollment_id uuid,
  p_legal_name text,
  p_dob date,
  p_license_no text,
  p_license_state text,
  p_phone text,
  p_county_id uuid,
  p_citation_no text,
  p_court_due_date date,
  p_security_question text,
  p_security_answer text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := (select auth.uid());
  citation text := upper(trim(coalesce(p_citation_no, '')));
  has_rules boolean;
  has_answer boolean;
begin
  if uid is null or not exists (
    select 1 from public.enrollments
    where id = p_enrollment_id and user_id = uid and status = 'active'
  ) then
    raise exception 'enrollment not found' using errcode = '42501';
  end if;

  if citation !~ '^[A-Z0-9-]{1,30}$' then
    raise exception 'citation_no format is not valid' using errcode = '23514';
  end if;
  if not exists (select 1 from public.counties where id = p_county_id) then
    raise exception 'county_id is not valid' using errcode = '23514';
  end if;
  select bool_or(citation_regex is not null) into has_rules
  from public.courts where county_id = p_county_id;
  if coalesce(has_rules, false) and not exists (
    select 1 from public.courts
    where county_id = p_county_id and citation_regex is not null
      and citation ~ citation_regex
  ) then
    raise exception 'citation_no does not match this county' using errcode = '23514';
  end if;
  if p_court_due_date is null or p_court_due_date < current_date then
    raise exception 'court_due_date is in the past' using errcode = '23514';
  end if;
  if p_security_question is null
    or p_security_question not in ('first_car', 'birth_city', 'first_school', 'favorite_teacher', 'childhood_street') then
    raise exception 'security_question is not valid' using errcode = '23514';
  end if;

  select exists (select 1 from public.security_questions where user_id = uid)
  into has_answer;
  if length(trim(coalesce(p_security_answer, ''))) < 2 and not has_answer then
    raise exception 'security_answer is too short' using errcode = '23514';
  end if;

  -- This function runs as its owner, so the lock trigger does not see the
  -- caller: check the lock here.
  if exists (
    select 1 from public.profiles
    where user_id = uid and details_locked_at is not null
      and (legal_name is distinct from trim(p_legal_name)
        or dob is distinct from p_dob
        or license_no is distinct from upper(trim(p_license_no)))
  ) then
    raise exception 'details are locked' using errcode = '42501';
  end if;

  update public.profiles
  set legal_name = trim(p_legal_name),
      dob = p_dob,
      license_no = upper(trim(p_license_no)),
      license_state = upper(trim(p_license_state)),
      phone = trim(p_phone)
  where user_id = uid;

  update public.enrollments
  set county_id = p_county_id,
      citation_no = citation,
      court_due_date = p_court_due_date
  where id = p_enrollment_id;

  if length(trim(coalesce(p_security_answer, ''))) >= 2 then
    insert into public.security_questions (user_id, question, answer_hash)
    values (
      uid, p_security_question,
      extensions.crypt(lower(trim(p_security_answer)), extensions.gen_salt('bf'))
    )
    on conflict (user_id) do update
    set question = excluded.question,
        answer_hash = excluded.answer_hash,
        updated_at = now();
  else
    update public.security_questions
    set question = p_security_question, updated_at = now()
    where user_id = uid;
  end if;
end;
$$;

revoke execute on function public.save_driver_details(uuid, text, date, text, text, text, uuid, text, date, text, text) from public, anon;
grant execute on function public.save_driver_details(uuid, text, date, text, text, text, uuid, text, date, text, text) to authenticated;

-- Called by the exam-start function (ticket 05). Not granted to clients.
create or replace function public.lock_driver_details(p_user_id uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.profiles
  set details_locked_at = now()
  where user_id = p_user_id and details_locked_at is null;
$$;

revoke execute on function public.lock_driver_details(uuid) from public, anon, authenticated;

create or replace function public.admin_update_locked_details(
  p_user_id uuid,
  p_legal_name text,
  p_dob date,
  p_license_no text,
  p_reason text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  before_row public.profiles;
begin
  if not public.is_admin() then
    raise exception 'admin only' using errcode = '42501';
  end if;
  if length(trim(coalesce(p_reason, ''))) < 5 then
    raise exception 'reason is required' using errcode = '23514';
  end if;

  select * into before_row from public.profiles where user_id = p_user_id;
  if not found then
    raise exception 'profile not found' using errcode = 'P0002';
  end if;

  perform set_config('app.details_override', 'on', true);
  update public.profiles
  set legal_name = p_legal_name, dob = p_dob, license_no = p_license_no
  where user_id = p_user_id;
  perform set_config('app.details_override', 'off', true);

  insert into public.audit_log (actor_id, action, entity, entity_id, before, after)
  values (
    (select auth.uid()),
    'profile.details_override',
    'profiles',
    before_row.id,
    jsonb_build_object(
      'legal_name', before_row.legal_name,
      'dob', before_row.dob,
      'license_no', before_row.license_no
    ),
    jsonb_build_object(
      'legal_name', p_legal_name,
      'dob', p_dob,
      'license_no', p_license_no,
      'reason', trim(p_reason)
    )
  );
end;
$$;

revoke execute on function public.admin_update_locked_details(uuid, text, date, text, text) from public, anon;
grant execute on function public.admin_update_locked_details(uuid, text, date, text, text) to authenticated;

create or replace function public.has_driver_details(p_enrollment_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.enrollments e
    join public.profiles p on p.user_id = e.user_id
    where e.id = p_enrollment_id
      and (e.user_id = (select auth.uid()) or public.is_admin())
      and coalesce(p.legal_name, '') <> ''
      and p.dob is not null
      and coalesce(p.license_no, '') <> ''
      and coalesce(p.phone, '') <> ''
      and e.county_id is not null
      and coalesce(e.citation_no, '') <> ''
      and e.court_due_date is not null
  );
$$;

revoke execute on function public.has_driver_details(uuid) from public, anon;
grant execute on function public.has_driver_details(uuid) to authenticated;
