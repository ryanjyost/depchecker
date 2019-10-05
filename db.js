const mongoose = require("mongoose");
const URL = "mongodb://skoosh:skoosh2002@ds223509.mlab.com:23509/deps-client";

// const URL =
//   "mongodb://skoosh:skoosh2002@ds127362.mlab.com:27362/newsbie-sandbox";

mongoose.connect(
  URL,
  { useNewUrlParser: true }
);
mongoose.Promise = global.Promise;
