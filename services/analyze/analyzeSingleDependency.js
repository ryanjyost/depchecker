const axios = require("axios");
const filesize = require("filesize");
const {
  forAxios,
  calculateVersionsBehind,
  getLicenseData,
  calculateLevels,
  getRepoUrlFromNpmRepoUrl,
  initSingleDepData
} = require("../../lib");

module.exports = async function analyzeSingleDependency(
  dep,
  packageJSON,
  forkedProcess
) {
  // easier to combine deps and loop through them all
  const dependencies = {
    ...packageJSON.devDependencies,
    ...packageJSON.dependencies
  };

  const projectVersion = dependencies[dep].replace(/[\^~]/g, "");

  // initialize the data structure for a single dep
  let DEP_DATA = initSingleDepData(
    dep,
    packageJSON.devDependencies && dep in packageJSON.devDependencies
  );

  DEP_DATA.versions.project = dependencies[dep];

  // get the npm package info
  const { data: npmData, error: npmError } = await forAxios(
    axios.get(`https://registry.npmjs.org/${dep}/`)
  );

  // not on npm, dont even bother trying to find on GitHub
  if (!npmData || npmError) {
    return finishDep(DEP_DATA, forkedProcess);
  }

  DEP_DATA = applyNpmData(DEP_DATA, npmData);
  DEP_DATA.time.project = npmData.time[dependencies[dep].replace(/[\^~]/g, "")];
  DEP_DATA.size = getSizeData(npmData, projectVersion);
  DEP_DATA.versionsBehind = calculateVersionsBehind(
    dependencies[dep],
    npmData["dist-tags"].latest
  );
  DEP_DATA = await getAndApplyGitHubData(DEP_DATA, npmData);

  const downloadsData = await getDownloadData(dep);
  if (downloadsData) {
    DEP_DATA.downloads.weekly = downloadsData;
    DEP_DATA.weeklyDownloads = downloadsData.downloads;
  }

  return finishDep(DEP_DATA, forkedProcess);
};

/**
 * Helpers
 */

function finishDep(dataToPush, forkedProcess) {
  const finalDepData = { ...dataToPush };
  // data is all there, calculate levels
  finalDepData.levels = calculateLevels(dataToPush);

  if (forkedProcess) {
    forkedProcess.send({ type: "singleDepData", data: finalDepData });
  }

  return finalDepData;
}

async function getDownloadData(dep) {
  try {
    const downloadsURL = `https://api.npmjs.org/downloads/point/last-week/${dep}`;
    const { data } = await forAxios(axios.get(`${downloadsURL}`));
    return data;
  } catch (e) {
    return null;
  }
}

function applyNpmData(depData, npmData) {
  depData.description = npmData.description;
  depData.links.homepage = npmData.homepage;
  depData["dist-tags"] = npmData["dist-tags"];
  depData.versions.latest = npmData["dist-tags"] && npmData["dist-tags"].latest;
  depData.time = {
    modified: npmData.time.modified,
    created: npmData.time.created,
    latest: npmData.time[npmData["dist-tags"].latest]
  };

  // check if the current version is deprecated
  const currVersionNpmData = npmData.versions[npmData["dist-tags"].latest];
  if (currVersionNpmData.deprecated) {
    depData.deprecated = currVersionNpmData.deprecated;
  }

  return depData;
}

function getSizeData(npmData, projectVersion) {
  const projectVersionNpmData = npmData.versions[projectVersion];
  if (projectVersionNpmData && projectVersionNpmData.dist) {
    return {
      unpacked: {
        raw: projectVersionNpmData.dist.unpackedSize,
        formatted: isNaN(projectVersionNpmData.dist.unpackedSize)
          ? projectVersionNpmData.dist.unpackedSize
          : filesize(projectVersionNpmData.dist.unpackedSize)
      }
    };
  }
}

async function getAndApplyGitHubData(depData, npmData) {
  let githubData;
  if (npmData) {
    if (npmData.repository && npmData.repository.url.includes("github.com")) {
      let repoUrl =
        npmData.repository && getRepoUrlFromNpmRepoUrl(npmData.repository.url);

      const githubUrl = `https://api.github.com/repos/${repoUrl}`;

      const { data } = await forAxios(
        axios.get(githubUrl, {
          auth: {
            username: process.env.GITHUB_CLIENT_ID,
            password: process.env.GITHUB_CLIENT_SECRET
          }
        })
      );

      githubData = data;
    }
  }

  if (githubData) {
    depData.links.github = githubData.html_url;
    depData.stars = githubData.stargazers_count;
    depData.license = getLicenseData(githubData.license, npmData.license);
    depData.openIssues = githubData.open_issues;
  }

  return depData;
}
