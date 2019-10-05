const generateSignedJWT = require("./generateSignedJWT");
const axios = require("axios");

module.exports = token => {
  token = token || generateSignedJWT();

  const api = axios.create({
    baseURL: "https://api.github.com",
    timeout: 3 * 60 * 1000,
    headers: {
      Accept: "application/vnd.github.machine-man-preview+json",
      Authorization: `Bearer ${token}`
    }
  });

  return {};
};
