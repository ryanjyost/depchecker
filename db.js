const mongoose = require("mongoose");
const URL = "mongodb://skoosh:skoosh2018@ds243084.mlab.com:43084/deps";

// const URL =
//   "mongodb://skoosh:skoosh2002@ds127362.mlab.com:27362/newsbie-sandbox";

mongoose.connect(
  URL,
  { useNewUrlParser: true }
);
mongoose.Promise = global.Promise;
