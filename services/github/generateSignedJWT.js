const jwt = require("jsonwebtoken");
const moment = require("moment");

module.exports = () => {
  const payload = {
    iat: moment().unix(),
    exp: moment().unix() + 5 * 60,
    iss: process.env.GITHUB_APP_IDENTIFIER
  };

  const buff = new Buffer(process.env.GITHUB_PRIVATE_KEY_BASE64, "base64");
  const key = buff.toString("ascii");

  return jwt.sign(payload, key, {
    algorithm: "RS256"
  });
};
