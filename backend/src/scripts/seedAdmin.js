// One-time setup script: creates the real Supabase Auth admin account and
// promotes its public.users profile to role = 'admin'.
//
// WHY IT EXISTS
// The Admin Dashboard previously ran entirely on a seeded demo account that did
// not exist in Supabase. Real driver management requires a genuine Supabase
// session for the admin (the backend authorizes the driver-management API from
// the admin's JWT), so the admin account must live in Supabase Auth too.
//
// HOW TO RUN
//   1. Add SUPABASE_SERVICE_ROLE_KEY to backend/.env
//      (Supabase Dashboard > Settings > API > `service_role` secret).
//   2. node src/scripts/seedAdmin.js
//   3. The admin can then sign in on the Login page (select Admin) with the
//      email/password configured below.
//
// SECURITY
//   * Uses the service-role key from backend/.env only (never the frontend).
//   * The password is managed by Supabase Auth; it is not stored in any public
//     table and is not logged.
//   * When the auth user is created, the handle_new_user trigger pre-creates a
//     public.users row with role = 'passenger' (the trigger is role-locked).
//     This script promotes that row to 'admin' using the service-role client.
//   * Idempotent: if the account already exists, it only fixes the profile role.

require("dotenv").config();

const supabaseAdmin = require("../config/supabaseAdmin");
const supabase = require("../config/supabase");

const ADMIN_EMAIL = process.env.SUPABASE_ADMIN_EMAIL || "admin@smarttransport.com";
const ADMIN_PASSWORD = process.env.SUPABASE_ADMIN_PASSWORD || "Admin@123";
const ADMIN_NAME = process.env.SUPABASE_ADMIN_NAME || "Vijay Raghavan";
const ADMIN_PHONE = process.env.SUPABASE_ADMIN_PHONE || "+91 98765 00001";

async function findUserByEmail(adminClient, email) {
  let cursor = null;
  for (let page = 0; page < 20; page += 1) {
    const params = { perPage: 200 };
    if (cursor) params.page = cursor;
    const { data, error } = await adminClient.auth.admin.listUsers(params);
    if (error) {
      throw new Error(`Could not list auth users: ${error.message}`);
    }
    const found = (data?.users || []).find(
      (u) => String(u.email || "").toLowerCase() === email
    );
    if (found) return found;
    if (!data?.nextPage || data.nextPage === data.lastPage) break;
    cursor = data.nextPage;
  }
  return null;
}

async function promoteProfile(userId) {
  const { data, error } = await supabaseAdmin
    .from("users")
    .update({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      phone: ADMIN_PHONE,
      role: "admin",
    })
    .eq("id", userId)
    .select("id, name, email, role")
    .single();

  if (error) {
    throw new Error(`Could not promote profile to admin: ${error.message}`);
  }
  return data;
}

async function main() {
  if (!supabaseAdmin) {
    console.error(
      "\nMissing SUPABASE_SERVICE_ROLE_KEY. Add it to backend/.env before running this script.\n"
    );
    process.exit(1);
  }
  if (!supabase) {
    console.error("\nMissing SUPABASE_URL / SUPABASE_KEY in backend/.env.\n");
    process.exit(1);
  }

  const existing = await findUserByEmail(supabaseAdmin, ADMIN_EMAIL);

  if (existing) {
    const profile = await promoteProfile(existing.id);
    console.log(
      `\nAdmin auth account already exists (${ADMIN_EMAIL}).\nProfile promoted to role='admin' (id=${profile.id}).\n`
    );
    return;
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true,
    user_metadata: {
      name: ADMIN_NAME,
      phone: ADMIN_PHONE,
      role: "admin",
    },
  });

  if (error) {
    throw new Error(`Could not create admin auth account: ${error.message}`);
  }

  const profile = await promoteProfile(data.user.id);

  console.log(
    `\nAdmin account created (${ADMIN_EMAIL}).\nProfile role set to 'admin' (id=${profile.id}).\n`
  );
  console.log(
    "You can now sign in on the Login page with the Admin role.\n"
  );
}

main().catch((err) => {
  console.error(`\nSeed admin failed: ${err.message}\n`);
  process.exit(1);
});
