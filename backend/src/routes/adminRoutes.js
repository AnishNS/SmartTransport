const express = require("express");

const router = express.Router();

const { requireAdmin } = require("../middleware/adminAuth");
const adminController = require("../controllers/adminController");

// All driver/vehicle-management routes require a verified admin session.
router.use(requireAdmin);

router.get("/", adminController.list);
router.post("/", adminController.create);

// Fleet management (vehicles). Declared before /:id so "vehicles" is never
// swallowed by the driver-id parameter.
router.get("/vehicles", adminController.vehicles);
router.post("/vehicles", adminController.createVehicle);
router.patch("/vehicles/:vehicleId", adminController.updateVehicle);
router.patch("/vehicles/:vehicleId/deactivate", adminController.deactivateVehicle);
router.patch("/vehicles/:vehicleId/reactivate", adminController.reactivateVehicle);
router.delete("/vehicles/:vehicleId", adminController.deleteVehicle);

router.get("/:id", adminController.getById);
router.patch("/:id/deactivate", adminController.deactivate);
router.patch("/:id/reactivate", adminController.reactivate);
router.post("/:id/vehicle", adminController.assign);
router.delete("/:id/vehicle", adminController.unassign);

module.exports = router;