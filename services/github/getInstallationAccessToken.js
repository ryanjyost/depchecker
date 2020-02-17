const axios = require("axios");
const qs = require("qs");

module.exports = function(code) {
  return axios.post(
    `https://github.com/login/oauth/access_token`,
    qs.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code
    })
  );
};
