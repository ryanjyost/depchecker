const nodemailer = require("nodemailer");
const Email = require("email-templates");
const { Installations } = require("../../models");
const { GitHub } = require("../../services");
const { forAxios, convertPackageJSONFromGitHub } = require("../helpers");
const analyzePackageJsonDeps = require("../../services/analyze");
const moment = require("moment");
const { severityLevels } = require("../../constants");
const { NA, GOOD, FINE, WARNING, BAD } = severityLevels;

module.exports = async function(installationId = 7212968) {
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

    const results = [];
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
      results.push(result);

      // console.log({ result });
    }

    /* === Send email === */
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "followthegithubstars@gmail.com",
        pass: process.env.EMAIL_PASS
      }
    });

    const email = new Email({
      message: {
        from: "followthegithubstars@gmail.com"
      },
      // uncomment below to send emails in development/test env:
      // send: true,
      transport: transporter
    });

    email
      .send({
        template: "report",
        message: {
          to: "followthegithubstars@gmail.com"
        },
        locals: buildEmailLocals(results)
      })
      .then(console.log)
      .catch(console.error);

    return true;
  } catch (e) {
    console.log("ERROR", e);
  }
};

function buildEmailLocals(results) {
  // console.log(results);
  let didLog = false;
  const deps = {},
    messages = {
      bad: []
    };

  for (let repo of results) {
    for (let dep of repo.deps) {
      if (deps[dep.name]) continue;
      if (!didLog) console.log(dep);
      didLog = true;

      const data = { name: dep.name, url: dep.links.npm, levels: dep.levels };

      if (data.levels.lastPublish === BAD) {
        messages.bad.push(
          `${dep.name} - ${Math.abs(
            moment().diff(moment(dep.time.latest), "months")
          )} months (${moment(dep.time.latest).format("MM/DD/YYYY")})`
        );
      }

      deps[dep.name] = data;
    }
  }

  console.log("+++++++");
  console.log(deps);
  console.log("+++++++");

  return {
    deps,
    messages
  };
}
