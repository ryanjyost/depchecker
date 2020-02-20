const axios = require("axios");
const filesize = require("filesize");
const {
  forAxios,
  calculateVersionsBehind,
  getLicenseData,
  getRepoUrlFromNpmRepoUrl,
  initSingleDepData
} = require("../../lib");

module.exports = async function analyzeSingleDependency(
  dep,
  rawProjectVersion,
  isDev
) {
  const projectVersion = rawProjectVersion.replace(/[\^~]/g, "");

  // initialize the data structure for a single dep
  let DEP_DATA = initSingleDepData(dep, isDev);

  // get the npm package info
  const { data: npmData, error: npmError } = await forAxios(
    axios.get(`https://registry.npmjs.org/${dep}/`)
  );

  // not on npm, dont even bother trying to find on GitHub
  if (!npmData || npmError) {
    return finishDep(DEP_DATA);
  }

  DEP_DATA = applyNpmData(DEP_DATA, npmData);
  DEP_DATA = await getAndApplyGitHubData(DEP_DATA, npmData);
  DEP_DATA = await getAndApplyDownloadData(DEP_DATA);
  DEP_DATA.size = getSizeData(npmData, npmData["dist-tags"].latest);

  // add project-specific data
  const projectVersionNpmData = npmData.versions[projectVersion];
  DEP_DATA.project.version = projectVersion;
  DEP_DATA.project.versionsBehind = calculateVersionsBehind(
    projectVersion,
    npmData["dist-tags"].latest
  );
  DEP_DATA.project.release = npmData.time[projectVersion];
  DEP_DATA.project.size = getSizeData(npmData, projectVersion);
  // const currVersionNpmData = npmData.versions[npmData["dist-tags"].latest];
  DEP_DATA.project.deprecated = projectVersionNpmData.deprecated || false;

  return finishDep(DEP_DATA);
};

/*********************************
 * Helpers
 */

function finishDep(dataToPush) {
  return dataToPush;
}

async function getAndApplyDownloadData(depData) {
  try {
    const downloadsURL = `https://api.npmjs.org/downloads/point/last-week/${depData.name}`;
    const { data } = await forAxios(axios.get(`${downloadsURL}`));

    if (data) {
      depData.downloads.weekly = data;
      depData.weeklyDownloads = data.downloads;
    }

    return depData;
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

function getSizeData(npmData, version) {
  const projectVersionNpmData = npmData.versions[version];
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
