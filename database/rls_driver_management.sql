-- RLS policies for real driver management.
--
-- Run this file in: Supabase Dashboard > SQL Editor > New query > Run.
-- Idempotent — safe to run multiple times.
--
-- WHAT IT DOES
--   1. Creates a SECURITY DEFINER is_admin() helper. Because it runs with the
--      table owner's privileges (which bypass RLS), policies can call it
--      without triggering infinite recursion when the check reads public.users
--      from a policy that is itself on public.users.
--   2. Enables Row Level Security on public.drivers (no-op if already enabled).
--   3. Lets a driver read their OWN driver row (drivers.user_id = auth.uid()).
--      A driver can never see other drivers.
--   4. Lets an ADMIN select/insert/update/delete the drivers table.
--   5. Lets an ADMIN select/update/delete the users table, so the admin role
--      can manage driver profiles too.
--
-- PASSENGERS: no policy matches the drivers table, so passengers can never
-- read driver rows or create drivers. Default-deny covers that.
--
-- NOTE: the admin Driver Management UI in this project goes through the Node
-- backend, which uses the service_role key (RLS is bypassed there by design).
-- These policies still matter: they enforce the same rules for any direct
-- database access (SQL editor, supabase-js with the anon key, future features)
-- and they guarantee drivers can self-serve their own profile.

---------------------------------------------------------
-- ADMIN ROLE HELPER
---------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.users
    where users.id = auth.uid()
      and users.role = 'admin'
  );
$$;

---------------------------------------------------------
-- DRIVERS
---------------------------------------------------------

alter table public.drivers enable row level security;

-- Driver: read own driver row.
drop policy if exists "drivers_select_own" on public.drivers;
create policy "drivers_select_own"
  on public.drivers
  for select
  using (auth.uid() = user_id);

-- Admin: full management of the drivers table.
drop policy if exists "drivers_admin_all" on public.drivers;
create policy "drivers_admin_all"
  on public.drivers
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

---------------------------------------------------------
-- USERS (admin access for profile management)
---------------------------------------------------------

-- Admin: read any user profile.
drop policy if exists "users_admin_select" on public.users;
create policy "users_admin_select"
  on public.users
  for select
  to authenticated
  using (public.is_admin());

-- Admin: update user profiles (e.g. promote driver, fix name/phone).
drop policy if exists "users_admin_update" on public.users;
create policy "users_admin_update"
  on public.users
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Admin: delete user profiles.
drop policy if exists "users_admin_delete" on public.users;
create policy "users_admin_delete"
  on public.users
  for delete
  to authenticated
  using (public.is_admin());
