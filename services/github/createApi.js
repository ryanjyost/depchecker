const generateSignedJWT = require("./generateSignedJWT");
const axios = require("axios");

module.exports = token => {
  token = token || generateSignedJWT();

  const basicAuthParams = `?client_id=${process.env.GITHUB_CLIENT_ID}&client_secret=${process.env.GITHUB_CLIENT_SECRET}`;

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

  // const githubURL = `${url.replace(
  //   "https://github.com",
  //   "https://api.github.com/repos"
  // )}/contents/package.json?client_id=${
  //   process.env.GITHUB_CLIENT_ID
  // }&client_secret=${process.env.GITHUB_CLIENT_SECRET}`;

  const getRepoPackageJSON = (owner, repo) =>
    api.get(`/repos/${owner}/${repo}/contents/package.json${basicAuthParams}`, {
      headers: {
        Authorization: null
      }
    });

  return {
    getUserInstallation,
    getInstallation,
    getRepo,
    getRepoPackageJSON
  };
};
