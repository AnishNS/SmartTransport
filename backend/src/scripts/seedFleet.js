// One-time seed: sample fleet vehicles linked to the seeded routes.
//
// Creates enough vehicles across the existing route network so the Admin flow
// (create route -> create vehicle for route -> assign vehicle to driver) can be
// tested immediately. Idempotent: skips vehicle numbers that already exist.
//
// Prereqs: apply database/routes_vehicle_route.sql and run seedRoutes.js first.
//
//   node src/scripts/seedFleet.js

require("dotenv").config();

const supabaseAdmin = require("../config/supabaseAdmin");

// [vehicle_number, vehicle_type, capacity, status, route_code, driver_email]
const VEHICLE_SEED = [
  ["TN-38-BU-1234", "City Bus", 40, "active", "RT-001", "driver1@gmail.com"],
  ["TN-38-BU-5678", "City Bus", 40, "active", "RT-002", null],
  ["TN-38-BU-9012", "City Bus", 40, "active", "RT-003", null],
  ["TN-38-BU-3456", "City Bus", 50, "active", "RT-004", null],
  ["TN-38-BU-7890", "City Bus", 40, "active", "RT-005", null],
  ["TN-38-BU-2345", "Mini Bus", 30, "active", "RT-006", null],
  ["TN-38-BU-6789", "City Bus", 50, "maintenance", "RT-007", null],
  ["TN-38-BU-1123", "Mini Bus", 30, "maintenance", "RT-008", null],
  ["TN-38-BU-4567", "City Bus", 40, "active", "RT-009", null],
  ["TN-38-BU-8901", "City Bus", 50, "active", "RT-010", null],
];

async function findRouteByCode(code) {
  const { data } = await supabaseAdmin
    .from("routes")
    .select("id, route_code, route_number, route_name")
    .eq("route_code", code)
    .maybeSingle();
  return data || null;
}

async function findDriverByEmail(email) {
  const { data: user } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("email", email)
    .eq("role", "driver")
    .maybeSingle();
  if (!user) return null;
  const { data: driver } = await supabaseAdmin
    .from("drivers")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  return driver?.id || null;
}

async function main() {
  if (!supabaseAdmin) {
    console.error(
      "\nMissing SUPABASE_SERVICE_ROLE_KEY. Add it to backend/.env before running this script.\n"
    );
    process.exit(1);
  }

  let created = 0;
  let skipped = 0;
  let assignedDriverId = null;

  // Resolve the demo driver (driver1@gmail.com) once so a seeded vehicle can be
  // pre-assigned, letting the Driver Dashboard test work out of the box.
  const targetDriver = VEHICLE_SEED.find((v) => v[5]);
  if (targetDriver) {
    assignedDriverId = await findDriverByEmail(targetDriver[5]);
  }

  for (const [vehicleNumber, vehicleType, capacity, status, routeCode, driverEmail] of VEHICLE_SEED) {
    const { data: existing } = await supabaseAdmin
      .from("vehicles")
      .select("id")
      .eq("vehicle_number", vehicleNumber)
      .maybeSingle();
    if (existing) {
      skipped += 1;
      continue;
    }

    const route = await findRouteByCode(routeCode);
    if (!route) {
      console.warn(`[seedFleet] route not found for code ${routeCode}, skipping ${vehicleNumber}`);
      continue;
    }

    const driverId = driverEmail ? assignedDriverId : null;
    const { error } = await supabaseAdmin.from("vehicles").insert({
      vehicle_number: vehicleNumber,
      vehicle_type: vehicleType,
      capacity,
      status,
      route_id: route.id,
      driver_id: driverId,
    });
    if (error) throw new Error(`Could not create ${vehicleNumber}: ${error.message}`);
    created += 1;
  }

  console.log(
    `\nFleet seeded: ${created} created, ${skipped} skipped (already present).` +
      (assignedDriverId
        ? `\nVehicle TN-38-BU-1234 assigned to the demo driver (${targetDriver[5]}).`
        : "") +
      "\n"
  );
}

main().catch((err) => {
  console.error(`\nSeed fleet failed: ${err.message}\n`);
  process.exit(1);
});
