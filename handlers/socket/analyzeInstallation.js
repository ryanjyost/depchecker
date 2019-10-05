const { fork } = require("child_process");
const { Installations } = require("../../models");
const { GitHub } = require("../../services");
const { Helpers } = require("../../lib");
const { forAxios } = Helpers;

module.exports = async function(installationId) {
  const installation = await Installations.findInstallation(installationId);
  const InstallationApi = await GitHub.createInstallationApi(installationId);

  async function handleSingleRepo(repo) {
    const analyze = fork("./lib/analyze");
    const { data, error } = await forAxios(
      InstallationApi.getPackageJson(installation.account.login, repo)
    );

    console.log("REPO DATA", data);

    const buff = new Buffer(data.content, "base64");
    let packageJSON = JSON.parse(buff.toString());

    this.socket.emit("startRepo", {
      packageJSON,
      meta: { ...{ name: repo }, ...gatherMeta(packageJSON) }
    });

    await analyze.send({ ...packageJSON, ...{ repoName: repo } });
    analyze.on("message", msg => {
      socket.emit(msg.type, { ...msg.data, ...{ parentRepo: repo } });
    });
  }

  for (let repo of installation.repos) {
    await handleSingleRepo(repo);
  }
};
