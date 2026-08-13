-- Safe driver deactivation (soft-delete).
--
-- Run this file in: Supabase Dashboard > SQL Editor > New query > Run.
-- Idempotent — safe to run multiple times.
--
-- WHY
--   Admin deactivation must NOT hard-delete a driver row because vehicles and
--   trips reference drivers(id) with ON DELETE default (NO ACTION). Deleting
--   a driver with an assigned vehicle or with trips would fail or corrupt the
--   related records. Instead the admin flow soft-deletes by setting
--   is_active = false; the backend also unassigns the driver's vehicle and
--   bans the Supabase Auth user so the driver can no longer sign in.
--
--   The column is purely additive — existing rows keep working and are treated
--   as active (default true). No RLS change is required: deactivation runs
--   through the backend service-role client (RLS bypassed by design), and the
--   existing "drivers_select_own" policy still lets a driver read their row.

alter table public.drivers
  add column if not exists is_active boolean not null default true;

-- Backfill in case the column was added as nullable in a previous attempt.
update public.drivers
   set is_active = true
 where is_active is null;