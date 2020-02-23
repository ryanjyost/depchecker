const axios = require("axios");
const {
  forAxios,
  calculateVersionsBehind,
  getLicenseData,
  calculateLevels,
  getRepoUrlFromNpmRepoUrl,
  initSingleDepData,
  summarizeAnalysis
} = require("../lib");

async function analyze(packageJSON, forkedProcess) {
  try {
    let depsData = [];

    let dependencies = {
      ...packageJSON.devDependencies,
      ...packageJSON.dependencies
    };

    for (let dep in dependencies) {
      function finishDep(dataToPush) {
        const finalDepData = { ...dataToPush };
        console.log("DATA to push", finalDepData);
        // data is all there, calcultate levels
        finalDepData.levels = calculateLevels(dataToPush);

        depsData.push(finalDepData);

        if (forkedProcess) {
          forkedProcess.send({ type: "singleDepData", data: finalDepData });
        }
      }

      const DEP_DATA = initSingleDepData(
        dep,
        packageJSON.devDependencies && dep in packageJSON.devDependencies
      );

      const { data: npmData, error: npmError } = await forAxios(
        axios.get(`https://registry.npmjs.org/${dep}/`)
      );

      if (npmError) {
        finishDep(DEP_DATA);
        continue;
      }

      const downloadsURL = `https://api.npmjs.org/downloads/point/last-week/${dep}`;
      const { data: downloadsData, error: downloadsError } = await forAxios(
        axios.get(`${downloadsURL}`)
      );

      let githubData;
      if (npmData) {
        if (
          npmData.repository &&
          npmData.repository.url &&
          npmData.repository.url.includes("github.com")
        ) {
          let repoUrl =
            npmData.repository &&
            getRepoUrlFromNpmRepoUrl(npmData.repository.url);

          const githubUrl = `https://api.github.com/repos/${repoUrl}?client_id=${process.env.GITHUB_CLIENT_ID}&client_secret=${process.env.GITHUB_CLIENT_SECRET}`;

          const { data, error: githubError } = await forAxios(
            axios.get(githubUrl)
          );
          githubData = data;
        }
      }

      DEP_DATA.description = npmData.description;
      DEP_DATA.links.homepage = npmData.homepage;
      DEP_DATA["dist-tags"] = npmData["dist-tags"];
      DEP_DATA.versions.latest = npmData["dist-tags"].latest;
      DEP_DATA.versions.project = dependencies[dep];
      DEP_DATA.time = {
        modified: npmData.time.modified,
        created: npmData.time.created,
        project: npmData.time[dependencies[dep].replace(/[\^~]/g, "")],
        latest: npmData.time[npmData["dist-tags"].latest]
      };

      DEP_DATA.versionsBehind = calculateVersionsBehind(
        dependencies[dep],
        npmData["dist-tags"].latest
      );

      if (githubData) {
        DEP_DATA.links.github = githubData.html_url;
        DEP_DATA.stars = githubData.stargazers_count;
        DEP_DATA.license = getLicenseData(githubData.license, npmData.license);
        DEP_DATA.openIssues = githubData.open_issues;
      }

      if (downloadsData) {
        DEP_DATA.downloads.weekly = downloadsData;
        DEP_DATA.weeklyDownloads = downloadsData.downloads;
      }

      // console.log(`=== ${dep} ===`);
      // console.log(DEP_DATA);

      finishDep(DEP_DATA);
    }

    const analysisSummary = summarizeAnalysis(depsData);

    if (forkedProcess) {
      forkedProcess.send({ type: "finalRepoData", data: analysisSummary });
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
}

process.on("message", async packageJSON => {
  console.log("Start analyzing...");
  const data = await analyze(packageJSON, process);
  process.send(data);
});

module.exports = analyze;
