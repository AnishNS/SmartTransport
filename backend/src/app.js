const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");


const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const routeRoutes = require("./routes/routeRoutes");
const driverRoutes = require("./routes/driverRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const reportRoutes = require("./routes/reportRoutes");


const app = express();

// CORS: default "*" is safe here because auth uses Bearer tokens, never
// cookies, so no credentials are exchanged cross-origin. For the HTTPS tunnel
// later, set ALLOWED_ORIGINS to a comma-separated list of origins, e.g.
//   ALLOWED_ORIGINS=https://abcdef.ngrok-free.app
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "*")
    .split(",")
    .map((origin) => origin.trim());

app.use(cors({ origin: allowedOrigins }));
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());


// Authentication Routes

app.use("/api/auth", authRoutes);


// Admin Routes (driver management etc.)

app.use("/api/admin/drivers", adminRoutes);

// Admin Route network reads (source for vehicle creation).

app.use("/api/admin/routes", routeRoutes);


// Driver Routes (self-scoped, auth-required)

app.use("/api/driver", driverRoutes);

// Role-scoped notification center (any authenticated user reads only their own).

app.use("/api/notifications", notificationRoutes);

// Accident / issue reports -> targeted admin notifications.

app.use("/api/reports", reportRoutes);



app.get("/", (req, res) => {

    res.json({
        message: "Smart Transport Backend Running"
    });

});


module.exports = app;