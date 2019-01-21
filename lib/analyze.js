const to = require("./helpers/to.js");
const axios = require("axios");
const TimeAgo = require("javascript-time-ago");
const en = require("javascript-time-ago/locale/en");
const moment = require("moment");

TimeAgo.addLocale(en);
const timeAgo = new TimeAgo("en-US");

module.exports = async function(req, res) {
  // console.log(req.body);
  let packageJSON = null;
  if (req.files) {
    packageJSON = JSON.parse(req.files.file.data);
  } else if (req.body.packageJSON) {
    packageJSON = JSON.parse(req.body.packageJSON);
  }

  console.log("PACKAGE", packageJSON);

  let depsData = [];
  try {
    for (let dep in packageJSON.dependencies) {
      let err, registryResponse, finalDepData;
      [err, registryResponse] = await to(
        axios.get(`https://registry.npmjs.org/${dep}/`)
      );

      if (err) {
        console.log("eRROr");
      } else {
        finalDepData = { ...registryResponse.data };
      }

      // get issues
      let issuesResponse;
      if (finalDepData.repository) {
        const issuesURL = `https://api.github.com/repos/${finalDepData.repository.url
          .split("github.com/")[1]
          .replace(".git", "")}?client_id=${
          process.env.GITHUB_CLIENT_ID
        }&client_secret=${process.env.GITHUB_CLIENT_SECRET}`;

        [err, issuesResponse] = await to(axios.get(`${issuesURL}`));
      } else {
        console.log("NO URL", finalDepData);
      }

      //console.log("ISSUES", issuesURL, issuesResponse.data);

      if (issuesResponse) {
        finalDepData.open_issues_count = issuesResponse.data.open_issues_count;
      }

      // get downloads
      let downloadsResponse;
      const downloadsURL = `https://api.npmjs.org/downloads/point/last-week/${dep}`;

      [err, downloadsResponse] = await to(axios.get(`${downloadsURL}`));

      if (downloadsResponse) {
        finalDepData.downloads = {};
        finalDepData.downloads.weekly = downloadsResponse.data;
      }

      depsData.push(finalDepData);
    }

    const csvData = createCSVData(depsData, packageJSON);

    res.json({ dependencies: csvData, csvData });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "ERROR" });
  }
};

const fields = ["name"];
const opts = { fields };

const createCSVData = (deps, packageJSON) => {
  let data = deps.map(dep => {
    const currentProjectVersion = packageJSON.dependencies[dep.name].replace(
      /[\^~]/g,
      ""
    );

    const currentProjectVersionWithSymbols = packageJSON.dependencies[dep.name];
    const levels = currentProjectVersion.split(".");

    const currentVersionBreakdown = {
      major: Number(levels[0]),
      minor: Number(levels[1]),
      patch: Number(levels[2])
    };

    const mostRecentReleaseBreakdown = {
      major: Number(dep["dist-tags"].latest.split(".")[0]),
      minor: Number(dep["dist-tags"].latest.split(".")[1]),
      patch: Number(dep["dist-tags"].latest.split(".")[2])
    };

    const versionsBehind = {
      major: mostRecentReleaseBreakdown.major - currentVersionBreakdown.major,
      minor: mostRecentReleaseBreakdown.minor - currentVersionBreakdown.minor,
      patch: mostRecentReleaseBreakdown.patch - currentVersionBreakdown.patch
    };

    const timeSinceLastVersionRelease = timeAgo.format(
      moment(dep.time[dep["dist-tags"].latest]).toDate()
    );

    const lastReleaseDate = moment(dep.time[dep["dist-tags"].latest]).format(
      "MMM DD, YYYY"
    );

    let result = {
      // name: dep.name,
      // description: dep.description,
      versionsBehindText: buildReleaseText(versionsBehind),
      currentProjectVersion,
      latestVersion: dep["dist-tags"].latest,
      timeSinceLastVersionRelease,
      lastReleaseDate,
      weeklyDownloads: dep.downloads.weekly.downloads
      // license: dep.license,
      // homepage: dep.homepage
      //currentProjectVersionWithSymbols
    };

    if ("open_issues_count" in dep) {
      dep.openIssuesAndPRs = dep.open_issues_count;
    }

    return { ...dep, ...result };
  });

  return data;
};

const buildReleaseText = versionsBehind => {
  let text = "";
  if (
    versionsBehind.major === 0 &&
    versionsBehind.minor === 0 &&
    versionsBehind.patch === 0
  ) {
    text = "Up to date";
  } else {
    if (versionsBehind.major > 0) {
      text = `${
        versionsBehind.major > 0
          ? `${versionsBehind.major} major${
              versionsBehind.major === 1 ? "" : "s"
            }`
          : ""
      }  `;
    } else if (versionsBehind.minor > 0) {
      text = `${
        versionsBehind.minor > 0
          ? `${versionsBehind.minor} minor${
              versionsBehind.minor === 1 ? "" : "s"
            }`
          : ""
      }  `;
    } else if (versionsBehind.patch > 0) {
      text = `${
        versionsBehind.patch > 0
          ? `${versionsBehind.patch} patch${
              versionsBehind.patch === 1 ? "" : "es"
            }`
          : ""
      }  `;
    }
  }

  return text.trim();
};
