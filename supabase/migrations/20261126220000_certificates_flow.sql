-- Ticket 08: certificate issue and public verification.

insert into storage.buckets (id, name, public)
values ('certificates', 'certificates', false)
on conflict (id) do nothing;

create or replace function public.issue_certificate(p_enrollment_id uuid)
returns public.certificates
language plpgsql
security definer
set search_path = ''
as $$
declare
  e public.enrollments;
  c public.certificates;
  attempts int := 0;
begin
  select * into e from public.enrollments where id = p_enrollment_id;
  if not found then
    raise exception 'enrollment_not_found';
  end if;
  if e.status <> 'completed'
     or not exists (
       select 1 from public.exam_attempts
       where enrollment_id = e.id and passed is true
     ) then
    raise exception 'not_completed';
  end if;

  select * into c from public.certificates where enrollment_id = e.id;
  if found then
    return c;
  end if;

  loop
    begin
      insert into public.certificates (enrollment_id, cert_no)
      values (
        e.id,
        'RR-' || to_char(now(), 'YYYY') || '-'
          || upper(substr(md5(gen_random_uuid()::text), 1, 8))
      )
      on conflict (enrollment_id) do nothing
      returning * into c;
      exit;
    exception when unique_violation then
      attempts := attempts + 1;
      if attempts > 5 then
        raise;
      end if;
    end;
  end loop;

  if c.id is null then
    -- Lost a race with another call: return the winner, queue nothing.
    select * into c from public.certificates where enrollment_id = e.id;
    return c;
  end if;

  insert into public.completion_reports (certificate_id, status)
  values (c.id, 'queued');
  return c;
end;
$$;

revoke execute on function public.issue_certificate(uuid) from public, anon, authenticated;
grant execute on function public.issue_certificate(uuid) to service_role;

create or replace function public.verify_certificate(p_cert_no text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (
      select jsonb_build_object(
        'valid', c.revoked_at is null,
        'completedAt', case when c.revoked_at is null
          then (e.completed_at at time zone 'America/Los_Angeles')::date end
      )
      from public.certificates c
      join public.enrollments e on e.id = c.enrollment_id
      where c.cert_no = upper(trim(p_cert_no))
    ),
    jsonb_build_object('valid', false, 'completedAt', null)
  );
$$;

revoke execute on function public.verify_certificate(text) from public;
grant execute on function public.verify_certificate(text) to anon, authenticated, service_role;
