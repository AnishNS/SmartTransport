const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");


const authRoutes = require("./routes/authRoutes");


const app = express();


app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());


// Authentication Routes

app.use("/api/auth", authRoutes);



app.get("/", (req, res) => {

    res.json({
        message: "Smart Transport Backend Running"
    });

});


module.exports = app;