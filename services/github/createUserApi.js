const axios = require("axios");

module.exports = token => {
  const api = axios.create({
    baseURL: "https://api.github.com",
    timeout: 3 * 60 * 1000,
    headers: {
      Accept: "application/vnd.github.machine-man-preview+json",
      Authorization: `token ${token}`
    }
  });

  const getUser = () => api.get("/user");

  return {
    getUser
  };
};
