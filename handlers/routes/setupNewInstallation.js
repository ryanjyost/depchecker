const { GitHub } = require("../../services");
const { Installations } = require("../../models");
const { forAxios } = require("../../lib");

module.exports = async function(req, res) {
  console.log("SETUP INSTALL");
  try {
    // code to exchange for access token
    const { installationId } = req.body;

    // create the api for DepChecker app to look up the installation
    const AppApi = await GitHub.createApi();

    // get info about the GH installation
    const { data, error } = await forAxios(
      AppApi.getInstallation(installationId)
    );

    console.log("install data", data);

    if (error) return res.status(404).json({ error: "Installation not found" });

    const InstallationApi = await GitHub.createInstallationApi(installationId);
    const { data: repoData, error: reposError } = await forAxios(
      InstallationApi.getInstallationRepos()
    );

    // create a Depchecker installation record
    const installation = await Installations.createInstallation(data);

    res.status(200).json({ response: { installation, repos: repoData } });
  } catch (e) {
    console.log(e);
  }
};
