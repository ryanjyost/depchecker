const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = new mongoose.Schema({
  name: String,
  created_at: { type: Date, default: new Date() },
  data: mongoose.Schema.Types.Mixed
});

Schema.plugin(uniqueValidator);

module.exports = mongoose.model("dependency", Schema);
