const express = require("express");

const router = express.Router();

const { requireAdmin } = require("../middleware/adminAuth");
const routeController = require("../controllers/routeController");

// Route reads require a verified admin session (the Admin fleet UI populates
// the vehicle route dropdown from here).
router.use(requireAdmin);

router.get("/", routeController.list);

module.exports = router;
