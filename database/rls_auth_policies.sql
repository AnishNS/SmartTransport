-- RLS policies for public.users to support Supabase Auth.
--
-- Run this file in: Supabase Dashboard > SQL Editor > New query > Run.
-- Idempotent — safe to run multiple times.
--
-- NOTE: Run database/auth_profile_trigger.sql as well. Because email
-- confirmation is enabled, the client cannot insert a profile at signup (no
-- session exists), so a server-side trigger on auth.users creates the profile.
-- These policies still matter: they let a passenger read/update their own row,
-- and they act as the safety net for the client-side lazy-create on first login
-- (used for pre-existing Auth accounts that predate the trigger).
--
-- What it does:
--   1. Enables Row Level Security on public.users (no-op if already enabled).
--   2. Lets an authenticated user read their OWN profile row.
--   3. Lets an authenticated user create their OWN profile row, but ONLY with
--      role = 'passenger' — a user can never self-register as driver/admin.
--   4. Lets an authenticated user update their OWN row while keeping the role
--      pinned to 'passenger' (no privilege escalation).
--   5. Lets an authenticated user delete their OWN row.
--
-- Supabase Auth credentials (auth.users) are managed by GoTrue; password_hash
-- in public.users is NOT used for authentication. Profile rows are inserted
-- with an empty password_hash purely because the column is NOT NULL.

alter table public.users enable row level security;

drop policy if exists "users_select_own" on public.users;
create policy "users_select_own"
  on public.users
  for select
  using (auth.uid() = id);

drop policy if exists "users_insert_own_passenger" on public.users;
create policy "users_insert_own_passenger"
  on public.users
  for insert
  with check (auth.uid() = id and role = 'passenger');

drop policy if exists "users_update_own_passenger" on public.users;
create policy "users_update_own_passenger"
  on public.users
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id and role = 'passenger');

drop policy if exists "users_delete_own" on public.users;
create policy "users_delete_own"
  on public.users
  for delete
  using (auth.uid() = id);
