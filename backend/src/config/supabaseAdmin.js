// Supabase admin client that uses the service_role key.
//
// The service_role key bypasses Row Level Security and can call the GoTrue
// Admin API (auth.admin.*), which is how an admin-created driver gets a real
// Supabase Auth account. It MUST live only on the server:
//   - never import this file from the frontend
//   - never put SUPABASE_SERVICE_ROLE_KEY in a VITE_* variable
//
// Kept separate from ./supabase.js (the anon-key client) so every normal,
// client-facing query still goes through RLS.

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = supabaseUrl && serviceRoleKey
    ? createClient(supabaseUrl, serviceRoleKey)
    : null;

module.exports = supabaseAdmin;
