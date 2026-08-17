// Admin service — real driver management backed by the Node/Express backend.
//
// The backend creates the Supabase Auth account (service-role, server-side) and
// the driver profile, so this service only talks to the backend API. The
// admin's Supabase access token is attached automatically by the API client.

import { apiRequest } from "../api/client";

// Returns the list of driver accounts (profile + driver row joined).
export async function listDrivers() {
  const { drivers } = await apiRequest("get", "/api/admin/drivers");
  return drivers || [];
}

// Creates a real driver account. `payload` contains the admin-entered fields:
//   { name, email, phone, licenseNumber, availabilityStatus, password }
// The temporary password is sent once to the backend, used to create the
// Supabase Auth account, and never returned or stored anywhere client-side.
export async function createDriver(payload) {
  return apiRequest("post", "/api/admin/drivers", payload);
}

// Soft-deletes a driver (marks inactive, releases vehicle, bans auth user).
export async function deactivateDriver(driverId) {
  return apiRequest("patch", `/api/admin/drivers/${driverId}/deactivate`);
}

// Re-activates a soft-deleted driver.
export async function reactivateDriver(driverId) {
  return apiRequest("patch", `/api/admin/drivers/${driverId}/reactivate`);
}

// Lists fleet vehicles. Pass { available: true } to get only unassigned,
// active vehicles that can be linked to a driver.
export async function listVehicles({ available = false } = {}) {
  const { vehicles } = await apiRequest(
    "get",
    `/api/admin/drivers/vehicles${available ? "?available=true" : ""}`
  );
  return vehicles || [];
}

// Lists every route in the network (backend public.routes). The Admin fleet UI
// populates its vehicle-route dropdown from here so vehicles always reference
// actual routes — never hardcoded names.
export async function listRoutes() {
  const { routes } = await apiRequest("get", "/api/admin/routes");
  return routes || [];
}

// Adds a vehicle to the fleet. `payload` contains the admin-entered fields:
//   { vehicleNumber, vehicleType, capacity, status, routeId }
export async function createVehicle(payload) {
  return apiRequest("post", "/api/admin/drivers/vehicles", payload);
}

// Updates editable fleet fields (vehicleType, capacity, status, routeId).
export async function updateVehicle(vehicleId, payload) {
  return apiRequest(
    "patch",
    `/api/admin/drivers/vehicles/${vehicleId}`,
    payload
  );
}

// Soft-deactivates a vehicle (status -> inactive, releases its driver).
export async function deactivateVehicle(vehicleId) {
  return apiRequest(
    "patch",
    `/api/admin/drivers/vehicles/${vehicleId}/deactivate`
  );
}

// Brings a deactivated vehicle back to active.
export async function reactivateVehicle(vehicleId) {
  return apiRequest(
    "patch",
    `/api/admin/drivers/vehicles/${vehicleId}/reactivate`
  );
}

// Hard-deletes a vehicle that has no trip/location history, with confirmation.
export async function deleteVehicle(vehicleId) {
  return apiRequest("delete", `/api/admin/drivers/vehicles/${vehicleId}`);
}

// Assigns `vehicleId` to the driver. The backend enforces exclusive
// assignment (a vehicle can only belong to one driver).
export async function assignVehicle(driverId, vehicleId) {
  return apiRequest("post", `/api/admin/drivers/${driverId}/vehicle`, {
    vehicleId,
  });
}

// Removes the vehicle assignment from a driver.
export async function unassignVehicle(driverId) {
  return apiRequest("delete", `/api/admin/drivers/${driverId}/vehicle`);
}
