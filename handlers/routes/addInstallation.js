const { GitHub } = require("../../services");
const { Installations } = require("../../models");
const { forAxios } = require("../../lib");

/**
 * POST /installations
 * Create a new installation record (NOT a GitHub installation, but DepChecker version)
 */
module.exports = async function(req, res) {
  // this is GH's installation id
  const { installationId } = req.body;

  // create the api for DepChecker app to look up the installation
  const AppApi = await GitHub.createApi();

  // get info about the GH installation
  const { data, error } = await forAxios(
    AppApi.getInstallation(installationId)
  );

  if (error) return res.status(404).json({ error: "Installation not found" });

  // create a Depchecker installation record
  const installation = await Installations.createInstallation({
    githubId: data.id,
    repos: [],
    account: {
      id: data.account.id,
      login: data.account.login,
      type: data.account.type
    }
  });

  res.status(200).json({ response: { installation } });
};
