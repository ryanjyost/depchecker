const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = new mongoose.Schema({
  githubId: { type: Number, unique: true },
  created_at: { type: Date, default: new Date() },
  repos: mongoose.Schema.Types.Mixed,
  account: mongoose.Schema.Types.Mixed
  // account: {
  //   id: Number,
  //   login: String,
  //   type: String
  // }
});

Schema.plugin(uniqueValidator);

module.exports = mongoose.model("installation", Schema);
