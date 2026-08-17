// Admin controllers for driver management.
//
// Every handler runs behind requireAdmin, so req.admin is always populated with
// the verified administrator's profile. Data operations go through the
// service-role service layer, never the browser.

const {
  listDrivers,
  getDriverById,
  createDriver,
  deactivateDriver,
  reactivateDriver,
  listVehicles,
  createVehicle,
  updateVehicle,
  deactivateVehicle,
  reactivateVehicle,
  deleteVehicle,
  assignVehicle,
  unassignVehicle,
} = require("../services/driverService");

// Maps an unexpected backend error to a safe, user-facing message while
// keeping the full technical detail in the server log (PART 19). Friendly
// validation errors raised by the services pass through unchanged.
function friendly(error, fallback) {
  const message = String(error?.message || "");
  if (message && !/Could not (load|create|update|assign|deactivate|reactivate|unassign|release|delete)/.test(message)) {
    return message;
  }
  return fallback;
}

async function list(req, res) {
  try {
    const drivers = await listDrivers();
    res.status(200).json({ success: true, drivers });
  } catch (error) {
    console.error("[admin:list] failed:", error.message);
    res.status(500).json({
      success: false,
      message: "Unable to load drivers. Please try again.",
    });
  }
}

async function getById(req, res) {
  try {
    const driver = await getDriverById(req.params.id);
    if (!driver) {
      return res
        .status(404)
        .json({ success: false, message: "Driver not found." });
    }
    res.status(200).json({ success: true, driver });
  } catch (error) {
    console.error("[admin:getById] failed:", error.message);
    res.status(500).json({
      success: false,
      message: "Unable to load the driver. Please try again.",
    });
  }
}

async function create(req, res) {
  try {
    const driver = await createDriver({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      licenseNumber: req.body.licenseNumber,
      availabilityStatus: req.body.availabilityStatus,
      password: req.body.password,
    });

    res.status(201).json({
      success: true,
      message: `Driver account for ${driver.name} was created. The driver can now sign in.`,
      driver,
    });
  } catch (error) {
    console.error("[admin:create] failed:", error.message);
    res.status(400).json({
      success: false,
      message: friendly(error, "Unable to create the driver. Please try again."),
    });
  }
}

async function deactivate(req, res) {
  try {
    const driver = await deactivateDriver(req.params.id);
    res.status(200).json({
      success: true,
      message: `${driver.name || "Driver"} was deactivated.`,
      driver,
    });
  } catch (error) {
    console.error("[admin:deactivate] failed:", error.message);
    res.status(400).json({
      success: false,
      message: friendly(error, "Unable to deactivate this driver. Please try again."),
    });
  }
}

async function reactivate(req, res) {
  try {
    const driver = await reactivateDriver(req.params.id);
    res.status(200).json({
      success: true,
      message: `${driver.name || "Driver"} was reactivated.`,
      driver,
    });
  } catch (error) {
    console.error("[admin:reactivate] failed:", error.message);
    res.status(400).json({
      success: false,
      message: friendly(error, "Unable to reactivate this driver. Please try again."),
    });
  }
}

async function vehicles(req, res) {
  try {
    const available = String(req.query.available) === "true";
    const vehicleList = await listVehicles({ available });
    res.status(200).json({ success: true, vehicles: vehicleList });
  } catch (error) {
    console.error("[admin:vehicles] failed:", error.message);
    res.status(500).json({
      success: false,
      message: "Unable to load vehicles. Please try again.",
    });
  }
}

async function createVehicleHandler(req, res) {
  try {
    const vehicle = await createVehicle({
      vehicleNumber: req.body.vehicleNumber,
      vehicleType: req.body.vehicleType,
      capacity: req.body.capacity,
      status: req.body.status,
      routeId: req.body.routeId,
    });
    res.status(201).json({
      success: true,
      message: `Vehicle ${vehicle.vehicle_number} was added to the fleet.`,
      vehicle,
    });
  } catch (error) {
    console.error("[admin:createVehicle] failed:", error.message);
    res.status(400).json({
      success: false,
      message: friendly(error, "Unable to create vehicle. Please try again."),
    });
  }
}

async function updateVehicleHandler(req, res) {
  try {
    const vehicle = await updateVehicle(req.params.vehicleId, {
      vehicleType: req.body.vehicleType,
      capacity: req.body.capacity,
      status: req.body.status,
      routeId: req.body.routeId,
    });
    res.status(200).json({
      success: true,
      message: `Vehicle ${vehicle.vehicle_number} was updated.`,
      vehicle,
    });
  } catch (error) {
    console.error("[admin:updateVehicle] failed:", error.message);
    res.status(400).json({
      success: false,
      message: friendly(error, "Unable to update the vehicle. Please try again."),
    });
  }
}

async function deactivateVehicleHandler(req, res) {
  try {
    const vehicle = await deactivateVehicle(req.params.vehicleId);
    res.status(200).json({
      success: true,
      message: `Vehicle ${vehicle.vehicle_number} was deactivated.`,
      vehicle,
    });
  } catch (error) {
    console.error("[admin:deactivateVehicle] failed:", error.message);
    res.status(400).json({
      success: false,
      message: friendly(error, "Unable to deactivate the vehicle. Please try again."),
    });
  }
}

async function reactivateVehicleHandler(req, res) {
  try {
    const vehicle = await reactivateVehicle(req.params.vehicleId);
    res.status(200).json({
      success: true,
      message: `Vehicle ${vehicle.vehicle_number} was reactivated.`,
      vehicle,
    });
  } catch (error) {
    console.error("[admin:reactivateVehicle] failed:", error.message);
    res.status(400).json({
      success: false,
      message: friendly(error, "Unable to reactivate the vehicle. Please try again."),
    });
  }
}

async function deleteVehicleHandler(req, res) {
  try {
    const vehicle = await deleteVehicle(req.params.vehicleId);
    res.status(200).json({
      success: true,
      message: `Vehicle ${vehicle.vehicle_number} was deleted.`,
      vehicle,
    });
  } catch (error) {
    console.error("[admin:deleteVehicle] failed:", error.message);
    res.status(400).json({
      success: false,
      message: friendly(error, "Unable to delete the vehicle. Please try again."),
    });
  }
}

async function assign(req, res) {
  try {
    const vehicle = await assignVehicle(req.params.id, req.body.vehicleId);
    res.status(200).json({
      success: true,
      message: `Vehicle ${vehicle.vehicle_number} was assigned to the driver.`,
      vehicle,
    });
  } catch (error) {
    console.error("[admin:assign] failed:", error.message);
    res.status(400).json({
      success: false,
      message: friendly(error, "Unable to assign the vehicle. Please try again."),
    });
  }
}

async function unassign(req, res) {
  try {
    const driver = await unassignVehicle(req.params.id);
    res.status(200).json({
      success: true,
      message: "Vehicle assignment was removed.",
      driver,
    });
  } catch (error) {
    console.error("[admin:unassign] failed:", error.message);
    res.status(400).json({
      success: false,
      message: friendly(error, "Unable to unassign the vehicle. Please try again."),
    });
  }
}

module.exports = {
  list,
  getById,
  create,
  deactivate,
  reactivate,
  vehicles,
  createVehicle: createVehicleHandler,
  updateVehicle: updateVehicleHandler,
  deactivateVehicle: deactivateVehicleHandler,
  reactivateVehicle: reactivateVehicleHandler,
  deleteVehicle: deleteVehicleHandler,
  assign,
  unassign,
};
