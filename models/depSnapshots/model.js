const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
  name: String,
  created_at: { type: Date, default: new Date() },
  data: mongoose.Schema.Types.Mixed,
  npm: String
});

module.exports = mongoose.model("depSnapshots", Schema);
