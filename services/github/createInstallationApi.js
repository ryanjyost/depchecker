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

  const getPackageJson = (owner, repoName, ref) =>
    api.get(
      `/repos/${owner}/${repoName}/contents/package.json`,
      ref ? { ref } : null
    );

  const getInstallationRepos = () => api.get(`/installation/repositories`);

  // const addWebhookToRepo = (owner, repo, payload) =>
  //   api.post(`/repos/${owner}/${repo}`, payload);

  return {
    get: api.get,
    post: api.post,
    getPackageJson,
    getInstallationRepos
  };
};
