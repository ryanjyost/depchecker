const { GitHub } = require("../../services");
const { Installations } = require("../../models");
const { forAxios } = require("../../lib");

module.exports = async function(req, res) {
  try {
    // code to exchange for access token
    const { installationId } = req.body;

    // create the api for DepChecker app to look up the installation
    const AppApi = await GitHub.createApi();

    // get info about the GH installation
    const { data, error } = await forAxios(
      AppApi.getInstallation(installationId)
    );

    if (error) return res.status(404).json({ error: "Installation not found" });

    const InstallationApi = await GitHub.createInstallationApi(installationId);
    const { data: repoData, error: reposError } = await forAxios(
      InstallationApi.getInstallationRepos()
    );

    // create a Depchecker installation record
    const installation = await Installations.createInstallation(data);

    // add web hooks to repos with
    for (let repo of repoData.repositories) {
      const { data: packageJSONContents } = await forAxios(
        InstallationApi.get(
          repo.contents_url.replace("{+path}", "package.json")
        )
      );
      if (!packageJSONContents.content) continue;

      console.log("------------------");
      console.log("REPO", repo);

      const hook = {
        name: "web",
        active: true,
        events: ["pull_request"],
        config: {
          url: "http://cf01928b.ngrok.io/github/webhook",
          content_type: "json",
          insecure_ssl: "0"
        }
      };

      // const { data: webhookResponse, error: webhooksError } = await forAxios(
      //   InstallationApi.post(repo.hooks_url, hook)
      // );
      //
      // if (webhooksError) console.log(webhooksError);
      //
      // console.log(webhookResponse);

      // const {data:packageJSON, error} = await forAxios(InstallationApi.getPackageJson())
    }

    res.status(200).json({ response: { installation, repos: repoData } });
  } catch (e) {
    console.log(e);
  }
};
