const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const depSchema = new mongoose.Schema({
  name: { type: String, unique: true },
  npm: mongoose.Schema.Types.Mixed,
  created_at: { type: Date, default: new Date() }
});

depSchema.plugin(uniqueValidator);

module.exports = mongoose.model("dependency", depSchema);
