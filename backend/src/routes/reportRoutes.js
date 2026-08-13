const express = require("express");

const router = express.Router();

const { requireAuth } = require("../middleware/authMiddleware");
const reportController = require("../controllers/reportController");

// Authenticated driver/passenger report endpoint. Reporter identity is
// resolved server-side from the verified session; the body only carries
// report content (category, description, optional location/vehicle).
router.use(requireAuth);

router.post("/", reportController.submit);

module.exports = router;