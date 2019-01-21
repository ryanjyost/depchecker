const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  refresh_token: String,
  bitbucket: mongoose.Schema.Types.Mixed,
  created_at: { type: Date, default: new Date() }
});

module.exports = mongoose.model("user", userSchema);
