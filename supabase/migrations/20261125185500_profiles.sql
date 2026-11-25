-- Ticket 03: profiles, roles and the admin check.

-- Shared `updated_at` trigger. `create or replace` so any migration may (re)define it.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create type public.app_role as enum ('student', 'admin');

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  role public.app_role not null default 'student',
  first_name text not null default '',
  last_name text not null default '',
  preferred_locale text not null default 'en'
    check (preferred_locale in ('en', 'ja', 'es', 'ru')),
  -- TODO(spec): local Supabase cannot allow unverified password sign-in, so email
  -- confirmations are off and the app tracks verification itself. Only the
  -- service role sets this (after a successful email-link sign-in). Revisit with
  -- hosted Supabase / Resend.
  email_verified_at timestamptz,
  -- Driver details (spec section 13), collected after payment in phase 3.
  -- The details lock trigger arrives with the final exam in phase 3.
  legal_name text,
  dob date,
  license_no text,
  license_state text,
  phone text,
  details_locked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;

-- The admin check used by every policy that grants Admin access. It is
-- `security definer` so `profiles` policies can use it without recursing.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where user_id = (select auth.uid())
      and role = 'admin'
  );
$$;

revoke execute on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated, service_role;

create policy "profiles: own row or admin can read"
on public.profiles for select
to authenticated
using (user_id = (select auth.uid()) or (select public.is_admin()));

create policy "profiles: own row or admin can update"
on public.profiles for update
to authenticated
using (user_id = (select auth.uid()) or (select public.is_admin()))
with check (user_id = (select auth.uid()) or (select public.is_admin()));

-- Rejects changes to protected columns unless the caller is an Admin or a
-- trusted server path (service role, or postgres in migrations/seeds/security
-- definer functions). RLS alone cannot do this: it sees rows, not columns.
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

create trigger profiles_guard_update
before update on public.profiles
for each row execute function public.guard_profile_update();

-- No insert or delete policies: profiles are created by the sign-up trigger
-- and removed with their auth user.

-- Creates the profile for every new auth user from sign-up metadata.
-- The role is never read from metadata: everyone starts as a Student.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  locale text := meta ->> 'preferred_locale';
begin
  insert into public.profiles (user_id, role, first_name, last_name, preferred_locale)
  values (
    new.id,
    'student',
    left(trim(coalesce(meta ->> 'first_name', '')), 100),
    left(trim(coalesce(meta ->> 'last_name', '')), 100),
    case when locale in ('en', 'ja', 'es', 'ru') then locale else 'en' end
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
