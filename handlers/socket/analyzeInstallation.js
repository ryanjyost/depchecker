const { fork } = require("child_process");
const { Installations } = require("../../models");
const { GitHub } = require("../../services");
const { forAxios, gatherMetaFromPackageJson } = require("../../lib");

module.exports = async function(socket, installationId) {
  const installation = await Installations.findInstallation(installationId);
  const InstallationApi = await GitHub.createInstallationApi(installationId);

  async function handleSingleRepo(repo) {
    const analyze = fork("./services/analyze");
    const { data, error } = await forAxios(
      InstallationApi.getPackageJson(installation.account.login, repo)
    );

    const buff = new Buffer.from(data.content, "base64");
    let packageJSON = JSON.parse(buff.toString());

    socket.emit("startRepo", {
      packageJSON,
      meta: { ...{ name: repo }, ...gatherMetaFromPackageJson(packageJSON) }
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
