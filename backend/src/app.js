const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");


const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const driverRoutes = require("./routes/driverRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const reportRoutes = require("./routes/reportRoutes");


const app = express();


app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());


// Authentication Routes

app.use("/api/auth", authRoutes);


// Admin Routes (driver management etc.)

app.use("/api/admin/drivers", adminRoutes);


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