const nodemailer = require("nodemailer");
const Email = require("email-templates");
const { Installations } = require("../../models");
const { GitHub } = require("../../services");
const { forAxios, convertPackageJSONFromGitHub } = require("../helpers");
const analyzePackageJsonDeps = require("../../services/analyze");

module.exports = async function(installationId = 7202316) {
  try {
    const installation = await Installations.findInstallation(installationId);
    const InstallationApi = await GitHub.createInstallationApi(installationId);

    const {
      data: { repositories: allGhRepos },
      error
    } = await forAxios(InstallationApi.getInstallationRepos());

    const reposToAnalyze = allGhRepos.filter(repo =>
      installation.repos.includes(repo.name)
    );

    // console.log("reposToAnalyze", reposToAnalyze);

    for (let repo of reposToAnalyze) {
      const { data: packageJSONContents } = await forAxios(
        InstallationApi.get(
          repo.contents_url.replace("{+path}", "package.json")
        )
      );

      const packageJson = convertPackageJSONFromGitHub(
        packageJSONContents.content
      );

      const result = await analyzePackageJsonDeps(packageJson);

      console.log({ result });
    }

    /* === Get analysis data === */
    // for (let repo of installation.repos) {
    //   const { data, error } = await forAxios(
    //     InstallationApi.getInstallationRepos()
    //   );
    // }

    // const { data, error } = await forAxios(analyzePackageJsonDeps());

    /* === Send email === */
    // const transporter = nodemailer.createTransport({
    //   service: "gmail",
    //   auth: {
    //     user: "followthegithubstars@gmail.com",
    //     pass: process.env.EMAIL_PASS
    //   }
    // });
    //
    // const email = new Email({
    //   message: {
    //     from: "followthegithubstars@gmail.com"
    //   },
    //   // uncomment below to send emails in development/test env:
    //   // send: true,
    //   transport: transporter
    // });
    //
    // email
    //   .send({
    //     template: "report",
    //     message: {
    //       to: "followthegithubstars@gmail.com"
    //     },
    //     locals: {}
    //   })
    //   .then(console.log)
    //   .catch(console.error);

    return true;
  } catch (e) {
    console.log("ERROR", e);
  }
};
