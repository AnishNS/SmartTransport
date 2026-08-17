const express = require("express");

const router = express.Router();

const { requireAuth } = require("../middleware/authMiddleware");
const driverController = require("../controllers/driverController");

// All driver-facing routes require a valid session. Handlers scope data access
// to req.authUser.id, so a driver can only ever read their own profile.
router.use(requireAuth);

router.get("/profile", driverController.profile);
router.get("/trips/current", driverController.currentTrip);
router.post("/trips", driverController.startTrip);
router.patch("/trips/:tripId/end", driverController.endTrip);

module.exports = router;
