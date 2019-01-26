const express = require("express");
const path = require("path");
const favicon = require("serve-favicon");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");
const db = require("./db");
const fileUpload = require("express-fileupload");
const axios = require("axios");
var http = require("http");
const socketIo = require("socket.io");
var debug = require("debug")("deps:server");
var blocked = require("blocked");
const { fork } = require("child_process");
require("dotenv").config();

const to = require("./lib/helpers/to.js");

const index = require("./routes/index");
const users = require("./routes/users");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(process.env.PORT || "5000");
app.set("port", port);

server.listen(port);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());
app.use(fileUpload());

app.use("/", index);
app.use("/users", users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

io.on("connection", socket => {
  console.log("New client connected");
  socket.emit("socketId", socket.id);

  socket.on("analyze", packageJSON => {
    const analyze = fork("lib/analyze.js");
    analyze.send(packageJSON);
    analyze.on("message", msg => {
      if (typeof msg !== "string") {
        socket.emit("final", msg);
      } else {
        socket.emit("update", msg);
      }
    });
  });
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

blocked((time, stack) => {
  console.log(`Blocked for ${time}ms, operation started here:`, stack);
});

// server.on("error", onError);
// server.on("listening", onListening);

module.exports = app;

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  var bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
  debug("Listening on " + bind);
}
