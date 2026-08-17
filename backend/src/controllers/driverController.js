// Driver-facing controllers.
//
// Self-scoped endpoints only: every handler resolves the caller's identity from
// the verified Supabase JWT (requireAuth) and reads ONLY that user's own driver
// record. A user can never request another user's data through these routes;
// admin operations stay behind requireAdmin in adminController.

const { getDriverByUserId } = require("../services/driverService");
const tripService = require("../services/tripService");
const liveBus = require("../realtime/liveBusService");

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

async function currentTrip(req, res) {
  const userId = req.authUser?.id;
  if (!userId) {
    return res
      .status(401)
      .json({ success: false, message: "Authentication required." });
  }

  try {
    const { trip } = await tripService.findCurrentTrip(userId);
    res.status(200).json({ success: true, trip });
  } catch (error) {
    console.error("[driver:trip] could not load current trip:", error.message);
    res.status(500).json({
      success: false,
      message: "Unable to load the current trip. Please try again.",
    });
  }
}

async function startTrip(req, res) {
  const userId = req.authUser?.id;
  if (!userId) {
    return res
      .status(401)
      .json({ success: false, message: "Authentication required." });
  }

  try {
    const trip = await tripService.startTrip(userId, {
      routeId: req.body?.routeId || null,
    });
    res.status(200).json({
      success: true,
      message: "Trip started.",
      trip,
    });
  } catch (error) {
    console.error("[driver:trip] could not start trip:", error.message);
    res.status(400).json({
      success: false,
      message: error.message || "Unable to start the trip. Please try again.",
    });
  }
}

async function endTrip(req, res) {
  const userId = req.authUser?.id;
  if (!userId) {
    return res
      .status(401)
      .json({ success: false, message: "Authentication required." });
  }

  try {
    const { trip, vehicle_id: vehicleId } = await tripService.endTrip(
      userId,
      req.params.tripId
    );
    // Listeners must drop this bus from the live map immediately.
    liveBus.removeVehicleLocation(vehicleId);
    res.status(200).json({
      success: true,
      message: "Trip ended.",
      trip,
    });
  } catch (error) {
    console.error("[driver:trip] could not end trip:", error.message);
    res.status(400).json({
      success: false,
      message: error.message || "Unable to end the trip. Please try again.",
    });
  }
}

module.exports = { profile, currentTrip, startTrip, endTrip };