// Driver-facing controllers.
//
// Self-scoped endpoints only: every handler resolves the caller's identity from
// the verified Supabase JWT (requireAuth) and reads ONLY that user's own driver
// record. A user can never request another user's data through these routes;
// admin operations stay behind requireAdmin in adminController.

const { getDriverByUserId } = require("../services/driverService");

async function profile(req, res) {
  const userId = req.authUser?.id;
  if (!userId) {
    return res
      .status(401)
      .json({ success: false, message: "Authentication required." });
  }

  try {
    const driver = await getDriverByUserId(userId);
    res.status(200).json({ success: true, driver: driver || null });
  } catch (error) {
    // Never expose raw PostgreSQL/Supabase error strings to the UI.
    console.error("[driver] could not load profile:", error.message);
    res.status(500).json({
      success: false,
      message: "Unable to load driver information. Please try again.",
    });
  }
}

module.exports = { profile };