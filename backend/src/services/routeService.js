// Route service — reads the route network from public.routes.
//
// Routes are the top of the ADMIN -> Route -> Vehicle -> Driver -> Trip chain.
// They are seeded from the canonical route dataset (see scripts/seedRoutes.js).
// This service exposes read helpers for the Admin fleet UI (route dropdown) and
// for validating that a vehicle/trip references a real route.

const supabaseAdmin = require("../config/supabaseAdmin");

function requireAdminClient() {
  if (!supabaseAdmin) {
    throw new Error(
      "Backend service-role client is not configured. Set SUPABASE_SERVICE_ROLE_KEY in backend/.env."
    );
  }
  return supabaseAdmin;
}

// Whitelisted route shape returned to the UI.
function buildRoute(row) {
  return {
    id: row.id,
    route_code: row.route_code,
    route_number: row.route_number,
    route_name: row.route_name,
    source: row.source,
    destination: row.destination,
    distance: row.distance,
    estimated_time: row.estimated_time,
  };
}

// Lists every route ordered by its business code. Used by the Admin fleet UI
// so vehicles always reference actual routes — never hardcoded names.
async function listRoutes() {
  const admin = requireAdminClient();
  const { data, error } = await admin
    .from("routes")
    .select("id, route_code, route_number, route_name, source, destination, distance, estimated_time")
    .order("route_code", { ascending: true });

  if (error) {
    throw new Error(`Could not load routes: ${error.message}`);
  }
  return (data || []).map(buildRoute);
}

async function getRouteById(routeId) {
  const admin = requireAdminClient();
  if (!routeId) return null;
  const { data, error } = await admin
    .from("routes")
    .select("id, route_code, route_number, route_name, source, destination, distance, estimated_time")
    .eq("id", routeId)
    .maybeSingle();
  if (error) throw new Error(`Could not load route: ${error.message}`);
  return data ? buildRoute(data) : null;
}

// Returns true only when the id references an existing routes row. Used by the
// vehicle create/update/assign paths to reject vehicles without a valid route.
async function routeExists(routeId) {
  const route = await getRouteById(routeId);
  return Boolean(route);
}

module.exports = { listRoutes, getRouteById, routeExists };
