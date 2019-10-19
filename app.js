const express = require("express");
const path = require("path");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const http = require("http");
const socketIo = require("socket.io");
const debug = require("debug")("deps:server");
require("./db");
require("dotenv").config();

const Handlers = require("./handlers");

const app = express();
const server = http.createServer(app);
const port = Handlers.server.normalizePort(process.env.PORT || "5000");

// set server port
app.set("port", port);
server.listen(port);

// 3rd party middleware
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());
app.use(fileUpload());

const index = require("./routes/index");
app.use("/", index);
app.use(Handlers.middleware.notFound);
app.use(Handlers.middleware.error);

// start Socket.io and listen for new connections
const io = socketIo(server);
io.on("connection", Handlers.socket);

server.on("error", Handlers.server.onError);
server.on("listening", onListening);

module.exports = app;

function onListening() {
  const addr = server.address();
  const bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
  debug("Listening on " + bind);
}
