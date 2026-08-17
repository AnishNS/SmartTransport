// Socket.IO real-time layer.
//
// Attached to the same HTTP server as Express (Singlepoint for the socket.io
// feed). Every connection is authenticated with the caller's Supabase JWT via
// the same token verification the HTTP middleware uses.
//
// Event contract
//   driver  -> server : driver:location:update  <-{ driverId, vehicleId, tripId,
//                                                 latitude, longitude, accuracy, timestamp }
//   server  -> all    : vehicle:location:update ->{ vehicleId, tripId, driverId,
//                                                 latitude, longitude, accuracy,
//                                                 timestamp, vehicleNumber, routeId,
//                                                 routeName, status }
//   server  -> all    : vehicle:trip:ended      ->{ vehicleId }
//   server  -> client : location:snapshot       ->[ latest active vehicle locations ]
//
// A `driver:location:update` is ONLY trusted after verifying, against Supabase,
// that the sender is the driver of that vehicle AND the trip is actually their
// currently active trip. Arbitrary users cannot push location data.

const { Server } = require("socket.io");
const supabase = require("../config/supabase");
const supabaseAdmin = require("../config/supabaseAdmin");
const { getDriverByUserId } = require("../services/driverService");
const liveBus = require("../realtime/liveBusService");

const ACTIVE_TRIP_STATUSES = ["in_progress", "paused"];

function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function validTimestamp(value) {
  if (value == null) return new Date().toISOString();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

// --- auth middleware -------------------------------------------------------

async function authenticate(socket, next) {
  const token =
    (socket.handshake && socket.handshake.auth && socket.handshake.auth.token) ||
    "";

  if (!token || token === "undefined") {
    return next(new Error("Authentication required. Please sign in."));
  }

  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) {
      return next(new Error("Session is invalid or has expired."));
    }
    socket.data.user = data.user;
    next();
  } catch {
    return next(new Error("Session is invalid or has expired."));
  }
}

// --- driver location validation -------------------------------------------

// Verifies (with a short-lived per-socket cache) that the trip belongs to the
// connected driver and their currently assigned vehicle.
async function verifyActiveTrip(socket, { tripId, vehicleId }) {
  const now = Date.now();
  const cache = socket.data.tripCache || {};

  if (
    cache.tripId === tripId &&
    cache.vehicleId === vehicleId &&
    cache.verifiedAt &&
    now - cache.verifiedAt < 30000
  ) {
    return cache.trip;
  }

  const { data: trip, error } = await supabaseAdmin
    .from("trips")
    .select("id, driver_id, vehicle_id, route_id, status, routes(route_name)")
    .eq("id", tripId)
    .is("end_time", null)
    .in("status", ACTIVE_TRIP_STATUSES)
    .maybeSingle();

  if (error || !trip || trip.driver_id !== socket.data.driver.id || trip.vehicle_id !== vehicleId) {
    return null;
  }

  const routeName =
    trip.routes && trip.routes.route_name ? trip.routes.route_name : null;

  socket.data.tripCache = {
    tripId: trip.id,
    vehicleId: trip.vehicle_id,
    routeId: trip.route_id,
    routeName,
    verifiedAt: now,
  };
  return trip;
}

// Builds a minimal, whitelisted payload for the passenger feed. No email,
// phone, or license data ever leaves the server.
function buildLocationRecord(socket, trip, payload) {
  return {
    vehicleId: socket.data.driver.vehicle.id,
    tripId: trip.id,
    driverId: socket.data.driver.id,
    vehicleNumber: socket.data.driver.vehicle.vehicle_number,
    routeId: socket.data.tripCache.routeId ?? null,
    routeName: socket.data.tripCache.routeName,
    latitude: payload.latitude,
    longitude: payload.longitude,
    accuracy: payload.accuracy ?? null,
    timestamp: validTimestamp(payload.timestamp),
    status: "Active",
  };
}

// --- connection handling ---------------------------------------------------

async function onConnection(socket) {
  // Preload the caller's driver record + assigned vehicle once per connection.
  const user = socket.data.user;
  try {
    socket.data.driver = await getDriverByUserId(user.id);
  } catch (err) {
    console.warn("[socket] could not resolve driver:", err.message);
    socket.data.driver = null;
  }
  socket.data.tripCache = null;

  // Initial state for every client (passengers render active buses immediately).
  socket.emit("location:snapshot", liveBus.getLatestLocations());
  socket.on("passenger:get-snapshot", () => {
    socket.emit("location:snapshot", liveBus.getLatestLocations());
  });

  socket.on(
    "driver:location:update",
    async (payload, ack) => {
      const respond = (result) => {
        if (typeof ack === "function") ack(result);
      };

      const driver = socket.data.driver;
      if (!driver) {
        return respond({ success: false, error: "Driver profile not found." });
      }

      const body = payload && typeof payload === "object" ? payload : {};
      const hasValidCoords =
        isFiniteNumber(body.latitude) &&
        body.latitude >= -90 &&
        body.latitude <= 90 &&
        isFiniteNumber(body.longitude) &&
        body.longitude >= -180 &&
        body.longitude <= 180;

      if (!hasValidCoords) {
        return respond({ success: false, error: "Invalid location." });
      }
      if (body.accuracy != null && !(isFiniteNumber(body.accuracy) && body.accuracy >= 0)) {
        return respond({ success: false, error: "Invalid accuracy." });
      }
      if (driver.id !== body.driverId) {
        return respond({ success: false, error: "Not authorized for this driver." });
      }

      const vehicle = driver.vehicle;
      if (!vehicle || vehicle.id !== body.vehicleId) {
        return respond({
          success: false,
          error: "This vehicle is not assigned to you.",
        });
      }

      const trip = await verifyActiveTrip(socket, {
        tripId: body.tripId,
        vehicleId: body.vehicleId,
      });

      if (!trip) {
        return respond({
          success: false,
          error: "No active trip found for this vehicle.",
        });
      }

      const record = buildLocationRecord(socket, trip, {
        latitude: body.latitude,
        longitude: body.longitude,
        accuracy: body.accuracy,
        timestamp: body.timestamp,
      });
      liveBus.updateVehicleLocation(record);
      respond({ success: true });
    }
  );
}

function createSocketServer(httpServer) {
  // Same CORS policy as Express (see backend/src/app.js). Auth uses Bearer
  // tokens, so "*" is fine for development. Pin ALLOWED_ORIGINS before going
  // through an HTTPS tunnel so only the tunnel origin is accepted.
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || "*")
    .split(",")
    .map((origin) => origin.trim());

  const io = new Server(httpServer, {
    cors: { origin: allowedOrigins, methods: ["GET", "POST"] },
  });

  io.use(authenticate);

  io.on("connection", onConnection);

  liveBus.setIO(io);

  return io;
}

module.exports = { createSocketServer };