-- Ticket 04: the first Admin, and Admin access to announcements.

-- Promotes an existing account to Admin by email. Used only by the admin seed
-- script (`pnpm db:make-admin <email>`) with the service role: no client role
-- may execute it, so there is no in-app path to becoming an Admin.
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
  return target_id;
end;
$$;

revoke execute on function public.make_admin(text) from public, anon, authenticated;
grant execute on function public.make_admin(text) to service_role;

-- Admins read every announcement (drafts too) and write them, per UI language.
-- TODO(spec): every Admin write must reach audit_log (spec section 13). Audit
-- logging of Admin writes arrives in phase 5 with the Admin screens; until then
-- these policies only exist so that phase needs no schema change.
create policy "Admins read every announcement"
  on public.announcements for select
  to authenticated
  using ((select public.is_admin()));

create policy "Admins create announcements"
  on public.announcements for insert
  to authenticated
  with check ((select public.is_admin()));

create policy "Admins update announcements"
  on public.announcements for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Admins delete announcements"
  on public.announcements for delete
  to authenticated
  using ((select public.is_admin()));
