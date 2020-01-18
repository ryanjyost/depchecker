const createApi = require("./createApi");
const {
  forAxios,
  convertPackageJSONFromGitHub,
  extractRepoDetailsFromUrl
} = require("../../lib");

module.exports = async function getPackageJSONFromRepoUrl(url) {
  const GitHubApi = createApi();
  const { owner, repo } = extractRepoDetailsFromUrl(url);
  const { data, error } = await forAxios(
    GitHubApi.getRepoPackageJSON(owner, repo)
  );

  return convertPackageJSONFromGitHub(data.content);
};
