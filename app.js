const express = require("express");
const path = require("path");
const favicon = require("serve-favicon");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");
const db = require("./db");
const fileUpload = require("express-fileupload");
require("dotenv").config();

const to = require("./lib/helpers/to.js");

const Slack = require("./lib/slack");
const SlackApi = Slack.createApi();

// const test = async function() {
//   let err, response;
//   // [err, response] = await to(Slack.sendMessage(SlackApi));
//
//   response = await Slack.sendMessage(SlackApi);
//
//   if (err) {
//     console.log(err);
//   } else {
//     console.log(response.data);
//   }
// };
//
// test();

//Slack.sendMessage(SlackApi);

const index = require("./routes/index");
const users = require("./routes/users");

const app = express();

app.use(fileUpload());

//shellScripts();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());

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

module.exports = app;
