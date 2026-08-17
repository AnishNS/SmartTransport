// One-time seed: populates public.routes from the canonical route network.
//
// The web app keeps the route network in apps/web/src/data/transport/routes.js
// (the single source the maps / planner / live simulation read). The backend
// needs the same routes in public.routes so that:
//   - vehicles can reference an actual route (vehicles.route_id FK)
//   - driver trips store a real route_id
//   - the Socket.IO live-bus feed can broadcast the route name
//
// This script is idempotent: it upserts by the unique route_code. Run it after
// applying database/routes_vehicle_route.sql:
//
//   node src/scripts/seedRoutes.js
//
// The dataset below is intentionally identical to the frontend routes file —
// route_code is the join key between the two layers.

require("dotenv").config();

const supabaseAdmin = require("../config/supabaseAdmin");

// [route_code, route_number, route_name, source, destination, distance_km, time_min]
const ROUTE_SEED = [
  ["RT-001", "1C", "Ukkadam – Gandhipuram", "Ukkadam", "Gandhipuram", 4.5, 25],
  ["RT-002", "2S", "Gandhipuram – Singanallur", "Gandhipuram", "Singanallur", 8, 30],
  ["RT-003", "3T", "Gandhipuram – Thudiyalur", "Gandhipuram", "Thudiyalur", 9, 35],
  ["RT-004", "4S", "Ukkadam – Saravanampatti", "Ukkadam", "Saravanampatti", 8, 35],
  ["RT-005", "5P", "Gandhipuram – Peelamedu", "Gandhipuram", "Peelamedu", 8, 30],
  ["RT-006", "6C", "Ukkadam – City Centre", "Ukkadam", "City Centre", 6, 30],
  ["RT-007", "7G", "Gandhipuram – Gandhi Nagar", "Gandhipuram", "Gandhi Nagar", 7, 35],
  ["RT-008", "8M", "Gandhipuram – Museum", "Gandhipuram", "Museum", 12, 50],
  ["RT-009", "9U", "Ukkadam – College Campus", "Ukkadam", "College Campus", 9, 40],
  ["RT-010", "10I", "Gandhipuram – Industrial Area", "Gandhipuram", "Industrial Area", 11, 45],
  ["RT-011", "11O", "Gandhipuram – Old Town", "Gandhipuram", "Old Town", 7, 25],
  ["RT-012", "1CR", "Gandhipuram – Ukkadam", "Gandhipuram", "Ukkadam", 4.5, 25],
  ["RT-013", "2SR", "Singanallur – Gandhipuram", "Singanallur", "Gandhipuram", 8, 30],
  ["RT-014", "3TR", "Thudiyalur – Gandhipuram", "Thudiyalur", "Gandhipuram", 9, 35],
  ["RT-015", "4SR", "Saravanampatti – Ukkadam", "Saravanampatti", "Ukkadam", 8, 35],
  ["RT-016", "5PR", "Peelamedu – Gandhipuram", "Peelamedu", "Gandhipuram", 8, 30],
  ["RT-017", "6CR", "City Centre – Ukkadam", "City Centre", "Ukkadam", 6, 30],
  ["RT-018", "7GR", "Gandhi Nagar – Gandhipuram", "Gandhi Nagar", "Gandhipuram", 7, 35],
  ["RT-019", "8MR", "Museum – Gandhipuram", "Museum", "Gandhipuram", 12, 50],
  ["RT-020", "9UR", "College Campus – Ukkadam", "College Campus", "Ukkadam", 9, 40],
  ["RT-021", "10IR", "Industrial Area – Gandhipuram", "Industrial Area", "Gandhipuram", 11, 45],
  ["RT-022", "11OR", "Old Town – Gandhipuram", "Old Town", "Gandhipuram", 7, 25],
];

async function main() {
  if (!supabaseAdmin) {
    console.error(
      "\nMissing SUPABASE_SERVICE_ROLE_KEY. Add it to backend/.env before running this script.\n"
    );
    process.exit(1);
  }

  let upserted = 0;
  let updated = 0;

  for (const [routeCode, routeNumber, routeName, source, destination, distance, estimatedTime] of ROUTE_SEED) {
    const { data: existing } = await supabaseAdmin
      .from("routes")
      .select("id")
      .eq("route_code", routeCode)
      .maybeSingle();

    if (existing) {
      const { error } = await supabaseAdmin
        .from("routes")
        .update({
          route_number: routeNumber,
          route_name: routeName,
          source,
          destination,
          distance,
          estimated_time: estimatedTime,
        })
        .eq("id", existing.id);
      if (error) throw new Error(`Could not update ${routeCode}: ${error.message}`);
      updated += 1;
    } else {
      const { error } = await supabaseAdmin.from("routes").insert({
        route_code: routeCode,
        route_number: routeNumber,
        route_name: routeName,
        source,
        destination,
        distance,
        estimated_time: estimatedTime,
      });
      if (error) throw new Error(`Could not insert ${routeCode}: ${error.message}`);
      upserted += 1;
    }
  }

  console.log(`\nRoutes seeded: ${upserted} created, ${updated} updated.\n`);
}

main().catch((err) => {
  console.error(`\nSeed routes failed: ${err.message}\n`);
  process.exit(1);
});
