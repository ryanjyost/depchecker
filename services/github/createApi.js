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

  const getUserInstallation = username =>
    api.get(`/users/${username}/installation`);

  const getInstallation = installationId =>
    api.get(`/app/installations/${installationId}`);

  const getRepo = repoUrl => api.get(`/repos/${repoUrl}`);

  return {
    getUserInstallation,
    getInstallation,
    getRepo
  };
};
