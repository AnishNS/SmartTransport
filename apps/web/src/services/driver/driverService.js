// Real driver profile service.
//
// Supplies the Driver dashboard/profile with the *authenticated* driver's
// record. Identity (name, email, phone, role) comes from public.users via the
// AuthContext; this service adds the operational driver row (license,
// availability, status) and the driver's assigned vehicle.
//
// Data flow:
//   Supabase Auth session -> Bearer token -> backend GET /api/driver/profile
//     (requireAuth -> service-role read of public.drivers scoped to auth.uid())
//     -> public.vehicles (driver_id join)
//
// The endpoint is used because, until database/rls_driver_management.sql is
// applied, the anon Supabase client cannot read public.drivers at all (no RLS
// policy), so a direct anon-key query always returns []. The backend owns the
// service-role read and only ever returns the caller's own driver row; the
// service_role key never leaves the server.

import { apiRequest } from "../api/client";

// Shape returned by the backend buildDriverRecord():
//   { id, user_id, name, email, phone, role, license_number,
//     availability_status, is_active, vehicle, created_at }
export async function getDriverProfile() {
  const data = await apiRequest("get", "/api/driver/profile");
  return data?.driver || null;
}

export default { getDriverProfile };