-- Route-driven vehicle fleet (routes -> vehicle -> driver -> trip).
--
-- Run this file in: Supabase Dashboard > SQL Editor > New query > Run.
-- Idempotent — safe to run multiple times.
--
-- WHY
--   Vehicles previously only carried a driver_id FK. To make the Admin flow
--   "create route -> create vehicle for route -> assign vehicle to driver"
--   real, every vehicle must reference an actual route in the `routes` table
--   (the same routes the driver trip / live-bus feed joins against).
--
--   The `routes` table gets two additive identifier columns:
--     route_code   -> stable business code (matches the frontend route dataset
--                     ids such as "RT-001", used by seed scripts).
--     route_number -> public route number shown in the UI (e.g. "1C").
--
--   vehicles.route_id is a plain FK; it stays null until the admin picks a
--   route for a vehicle, and the backend rejects assignment of a vehicle that
--   has no route.

alter table public.routes
  add column if not exists route_code varchar(40),
  add column if not exists route_number varchar(20);

-- Keep the business code unique so seed scripts can upsert routes idempotently.
create unique index if not exists routes_route_code_unique
  on public.routes (route_code);

alter table public.vehicles
  add column if not exists route_id uuid references public.routes(id);

-- Location history: the live-bus service persists a throttled copy of each GPS
-- fix to vehicle_locations. Add the columns the backend writes (driver_id,
-- trip_id, accuracy) so history is complete; a missing column is otherwise
-- tolerated (the backend skips persistence) but applying this keeps the record
-- authoritative.
alter table public.vehicle_locations
  add column if not exists driver_id uuid references public.drivers(id),
  add column if not exists trip_id uuid references public.trips(id),
  add column if not exists accuracy decimal;
