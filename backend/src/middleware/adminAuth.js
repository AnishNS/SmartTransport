// Admin authorization middleware.
//
// Verifies that the caller holds a valid Supabase session AND that their
// public.users profile has role = 'admin'. The caller's identity always comes
// from the trusted Supabase JWT (never from the request body), and the role is
// read from the trusted database row (never from client-supplied data).
//
// WHY THE PROFILE LOOKUP USES THE SERVICE-ROLE CLIENT
// The access token is validated by GoTrue (supabase.auth.getUser) using the
// anon-key client. But `getUser()` does not attach a per-request session to
// that client, so a subsequent public.users query through it has no
// auth.uid() — RLS treats it as anonymous and returns no row. The service-role
// client (which bypasses RLS) is therefore used for the role lookup; the JWT
// has already been cryptographically verified, and the service_role key stays
// server-side (never sent to the browser and never returned in responses).
// Admin data operations in the handlers also go through the service-role
// layer, so RLS policies are still enforced for every client-facing query.

const supabase = require("../config/supabase");
const supabaseAdmin = require("../config/supabaseAdmin");

async function requireAdmin(req, res, next) {
  const header = req.headers.authorization || "";

  if (!header.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authentication required. Please sign in.",
    });
  }

  const token = header.slice("Bearer ".length).trim();

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authentication required. Please sign in.",
    });
  }

  if (!supabase) {
    return res.status(500).json({
      success: false,
      message: "Backend Supabase client is not configured.",
    });
  }

  let authUser = null;
  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) {
      return res.status(401).json({
        success: false,
        message: "Session is invalid or has expired. Please sign in again.",
      });
    }
    authUser = data.user;
  } catch {
    return res.status(401).json({
      success: false,
      message: "Session is invalid or has expired. Please sign in again.",
    });
  }

  if (!supabaseAdmin) {
    return res.status(500).json({
      success: false,
      message: "Backend service-role client is not configured.",
    });
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("users")
    .select("id, name, email, role")
    .eq("id", authUser.id)
    .maybeSingle();

  if (profileError || !profile || profile.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "You do not have permission to perform this action.",
    });
  }

  req.admin = {
    id: profile.id,
    name: profile.name,
    email: profile.email,
  };

  next();
}

module.exports = { requireAdmin };
