const axios = require("axios");

module.exports = {
  createApi: function(token, timeout) {
    return axios.create({
      baseURL: "https://api.bitbucket.org/2.0/",
      timeout: 3 * 60 * 1000,
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` }
    });
  }
};
