require("dotenv").config();

const http = require("http");

const app = require("./app");
const { createSocketServer } = require("./socket");


const PORT = process.env.PORT || 5000;
// "0.0.0.0" binds every local interface so a phone on the same LAN can reach
// this machine. Override with HOST if you need a single interface later.
const HOST = process.env.HOST || "0.0.0.0";

// One HTTP server hosts both Express and Socket.IO so the real-time feed and
// the REST API share a single origin/port.
const server = http.createServer(app);

createSocketServer(server);

server.listen(PORT, HOST, () => {
    console.log(
        `Server running on ${HOST}:${PORT}`
    );
});