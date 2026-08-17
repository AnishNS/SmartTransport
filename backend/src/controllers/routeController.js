// Route controllers — admin-facing route network reads.
//
// Routes are the source of truth for vehicle creation (Route -> Vehicle ->
// Driver -> Trip). Every handler runs behind requireAdmin. The list endpoint
// feeds the Admin fleet UI's route dropdown so vehicles always reference real
// routes from the database.

const { listRoutes } = require("../services/routeService");

async function list(req, res) {
  try {
    const routes = await listRoutes();
    res.status(200).json({ success: true, routes });
  } catch (error) {
    console.error("[routes:list] failed:", error.message);
    res.status(500).json({
      success: false,
      message: "Unable to load routes. Please try again.",
    });
  }
}

module.exports = { list };
