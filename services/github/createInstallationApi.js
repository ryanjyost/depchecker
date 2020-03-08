const axios = require("axios");
const generateSignedJWT = require("./generateSignedJWT");

module.exports = async installationId => {
  const token = generateSignedJWT();
  const GitHubApi = await axios.create({
    baseURL: "https://api.github.com",
    timeout: 3 * 60 * 1000,
    headers: {
      Accept: "application/vnd.github.machine-man-preview+json",
      Authorization: `Bearer ${token}`
    }
  });
  const response = await GitHubApi.post(
    `/app/installations/${installationId}/access_tokens`
  );

  const instToken = response.data.token;
  const api = await axios.create({
    baseURL: "https://api.github.com",
    timeout: 3 * 60 * 1000,
    headers: {
      Accept: "application/vnd.github.machine-man-preview+json",
      Authorization: `Bearer ${instToken}`
    }
  });

  const getPackageJson = (loginName, repoName) =>
    api.get(`/repos/${loginName}/${repoName}/contents/package.json`);

  const getInstallationRepos = () => api.get(`/installation/repositories`);

  return {
    get: api.get,
    getPackageJson,
    getInstallationRepos
  };
};
