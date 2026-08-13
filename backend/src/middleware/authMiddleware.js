// Authentication middleware.
//
// Verifies that the caller holds a valid Supabase session. Unlike requireAdmin
// (adminAuthorization), this only authenticates — it does NOT assert a role.
// The authenticated identity is attached to req.authUser and every downstream
// handler must scope its data access to that identity so a user can never read
// another user's data.

const supabase = require("../config/supabase");

async function requireAuth(req, res, next) {
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

  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) {
      return res.status(401).json({
        success: false,
        message: "Session is invalid or has expired. Please sign in again.",
      });
    }
    req.authUser = data.user;
    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Session is invalid or has expired. Please sign in again.",
    });
  }
}

module.exports = { requireAuth };