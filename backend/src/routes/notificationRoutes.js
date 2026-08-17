const express = require("express");

const router = express.Router();

const { requireAuth } = require("../middleware/authMiddleware");
const notificationController = require("../controllers/notificationController");

// Authenticated notification endpoints. Handlers scope every read/update to
// the caller's own user id, so a user can only ever see their own rows.
router.use(requireAuth);

router.get("/", notificationController.list);
router.post("/", notificationController.create);
router.patch("/:id/read", notificationController.markRead);
router.patch("/read-all", notificationController.markAllRead);

module.exports = router;