const { GitHub } = require("../../services");
const { forAxios } = require("../../lib");

module.exports = async function(req, res) {
  const { installationId } = req.params;

  const InstallationApi = await GitHub.createInstallationApi(installationId);
  const { data, error } = await forAxios(
    InstallationApi.getInstallationRepos()
  );

  res
    .json({
      response: {
        repos: data.repositories
      }
    })
    .status(200);
};
