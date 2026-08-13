require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const admin = createClient(url, key);

const TARGET = "49383249-3cd3-4858-81dd-1ca667123dca";

async function main() {
  console.log("=== USERS matching target uuid ===");
  const u = await admin.from("users").select("*").or(`id.eq.${TARGET},email.eq.${TARGET}`).limit(5);
  console.log(JSON.stringify(u, null, 2));

  console.log("\n=== DRIVERS matching target uuid ===");
  const d = await admin.from("drivers").select("*").or(`id.eq.${TARGET},user_id.eq.${TARGET}`).limit(5);
  console.log(JSON.stringify(d, null, 2));

  console.log("\n=== USERS table (all) ===");
  const users = await admin.from("users").select("id, name, email, role").order("created_at", { ascending: false }).limit(20);
  console.log(JSON.stringify(users, null, 2));

  console.log("\n=== DRIVERS table (all) ===");
  const drivers = await admin.from("drivers").select("*").limit(20);
  console.log(JSON.stringify(drivers, null, 2));

  console.log("\n=== VEHICLES table (all) ===");
  const vehicles = await admin.from("vehicles").select("*").limit(20);
  console.log(JSON.stringify(vehicles, null, 2));

  console.log("\n=== NOTIFICATIONS table (all) ===");
  const notifs = await admin.from("notifications").select("*").limit(20);
  console.log(JSON.stringify(notifs, null, 2));

  console.log("\n=== TRIPS (count + sample) ===");
  const trips = await admin.from("trips").select("id, vehicle_id, driver_id, status").limit(10);
  console.log(JSON.stringify(trips, null, 2));

  console.log("\n=== ROUTES ===");
  const routes = await admin.from("routes").select("id, route_name, source, destination");
  console.log(JSON.stringify(routes, null, 2));

  console.log("\n=== STOPS sample ===");
  const stops = await admin.from("stops").select("id, route_id, stop_name").limit(10);
  console.log(JSON.stringify(stops, null, 2));

  process.exit(0);
}

main().catch((e) => { console.error("FATAL", e); process.exit(1); });