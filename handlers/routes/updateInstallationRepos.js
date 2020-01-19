const { Installations } = require("../../models");

module.exports = async function(req, res) {
  const installationId = req.params.installationid;
  const { repos } = req.body;

  const updatedInstallation = await Installations.updateInstallationRepos(
    installationId,
    repos
  );

  res.status(200).json({ response: { installation: updatedInstallation } });
};
