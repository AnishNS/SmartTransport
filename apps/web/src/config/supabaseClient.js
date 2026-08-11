// Supabase client configuration for the web app.
//
// Reads the Supabase project URL and anonymous (public) key from the Vite
// environment (apps/web/.env). A real client is only created when BOTH
// variables are present; otherwise this module exports null so the mock
// authentication service keeps working without any backend.
//
// NEVER put the service_role key or a database password here. The anon key is
// safe on the client because Supabase Row Level Security (RLS) gates the data
// a client can read or write.

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isConfigured = Boolean(supabaseUrl && supabaseAnonKey);

const supabaseClient = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export default supabaseClient;
