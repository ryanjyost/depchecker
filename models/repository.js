const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const repoSchema = new mongoose.Schema({
  id: Number,
  name: { type: String, unique: true },
  packageJSON: mongoose.Schema.Types.Mixed,
  bitbucket: mongoose.Schema.Types.Mixed,
  created_at: { type: Date, default: new Date() }
});

repoSchema.plugin(uniqueValidator);

module.exports = mongoose.model("repository", repoSchema);
