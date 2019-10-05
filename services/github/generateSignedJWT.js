const jwt = require("jsonwebtoken");
const moment = require("moment");

module.exports = () => {
  const payload = {
    iat: moment().unix(),
    exp: moment().unix() + 5 * 60,
    iss: process.env.GITHUB_APP_IDENTIFIER
  };

  return jwt.sign(payload, process.env.GITHUB_PRIVATE_KEY, {
    algorithm: "RS256"
  });
};
