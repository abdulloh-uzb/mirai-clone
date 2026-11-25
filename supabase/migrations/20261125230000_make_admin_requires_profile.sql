-- Review fix: `make_admin` reported success for an account with no profile row,
-- because the update matched nothing. It now raises when no profile changes.

create or replace function public.make_admin(target_email text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_id uuid;
begin
  select id into target_id
  from auth.users
  where lower(email) = lower(trim(target_email));

  if target_id is null then
    raise exception 'no account with email %', trim(target_email)
      using errcode = 'P0002';
  end if;

  update public.profiles set role = 'admin' where user_id = target_id;
  if not found then
    raise exception 'account % has no profile', trim(target_email)
      using errcode = 'P0002';
  end if;

  return target_id;
end;
$$;

revoke execute on function public.make_admin(text) from public, anon, authenticated;
grant execute on function public.make_admin(text) to service_role;
