const to = require("../helpers/to.js");
const axios = require("axios");

const calculateVersionsBehind = require("./calculateVersionsBehind");
const getLicenseData = require("./getLicenseData");
const calculateLevels = require("./calculateLevels");

module.exports = async function(packageJSON, forkedProcess) {
  try {
    let depsData = [];

    let dependencies = {
      ...packageJSON.devDependencies,
      ...packageJSON.dependencies
    };

    for (let dep in dependencies) {
      if (forkedProcess) {
        forkedProcess.send({ type: "startSingleDep", data: dep });
      }
      let err, registryResponse, githubResponse, downloadsResponse;
      [err, registryResponse] = await to(
        axios.get(`https://registry.npmjs.org/${dep}/`)
      );

      const downloadsURL = `https://api.npmjs.org/downloads/point/last-week/${dep}`;
      [err, downloadsResponse] = await to(axios.get(`${downloadsURL}`));

      const npmData = registryResponse.data;
      if (npmData) {
        let repoUrl = npmData.repository.url
          .split("github.com/")[1]
          .replace(".git", "");

        if (repoUrl.includes("/tree/")) {
          repoUrl = repoUrl.split("/tree/")[0];
        }

        const githubUrl = `https://api.github.com/repos/${repoUrl}?client_id=${
          process.env.GITHUB_CLIENT_ID
        }&client_secret=${process.env.GITHUB_CLIENT_SECRET}`;

        [err, githubResponse] = await to(axios.get(`${githubUrl}`));
        if (err) console.log("ERROR", err);
      }

      const DEP_DATA = {
        name: dep,
        links: { npm: `https://registry.npmjs.org/${dep}` },
        downloads: {},
        isDev:
          packageJSON.devDependencies && dep in packageJSON.devDependencies,
        versions: { project: dependencies[dep] }
      };

      DEP_DATA.description = npmData.description;
      DEP_DATA.links.homepage = npmData.homepage;
      DEP_DATA["dist-tags"] = npmData["dist-tags"];
      DEP_DATA.versions.latest = npmData["dist-tags"].latest;
      DEP_DATA.versionsBehind = calculateVersionsBehind(
        dependencies[dep],
        npmData["dist-tags"].latest
      );

      // get time stuff
      DEP_DATA.time = {
        modified: npmData.time.modified,
        created: npmData.time.created,
        project: npmData.time[dependencies[dep].replace(/[\^~]/g, "")],
        latest: npmData.time[npmData["dist-tags"].latest]
      };

      if (githubResponse) {
        DEP_DATA.links.github = githubResponse.data.html_url;
        DEP_DATA.stars = githubResponse.data.stargazers_count;
        DEP_DATA.license = getLicenseData(
          githubResponse.data.license,
          npmData.license
        );
        DEP_DATA.openIssues = githubResponse.data.open_issues;
      }

      if (downloadsResponse) {
        DEP_DATA.downloads.weekly = downloadsResponse.data;
        DEP_DATA.weeklyDownloads = downloadsResponse.data.downloads;
      }

      DEP_DATA.levels = calculateLevels(DEP_DATA);

      depsData.push(DEP_DATA);
      if (forkedProcess) {
        forkedProcess.send({ type: "singleDepData", data: DEP_DATA });
      }
    }

    if (forkedProcess) {
      forkedProcess.send({ type: "finalRepo", data: packageJSON.repoName });
    }

    return depsData.sort((a, b) => {
      a = a ? a.name || "" : "";
      b = b ? b.name || "" : "";

      if (a > b) return 1;
      if (b > a) return -1;

      return 0;
    });
  } catch (e) {
    console.log(e);
    return "error";
  }
};
