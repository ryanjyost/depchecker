const to = require("./helpers/to.js");
const axios = require("axios");
const TimeAgo = require("javascript-time-ago");
const en = require("javascript-time-ago/locale/en");
const moment = require("moment");
const qs = require("qs");
const client = require("request");

TimeAgo.addLocale(en);
const timeAgo = new TimeAgo("en-US");

process.on("message", async packageJSON => {
  let err, data;
  [err, data] = await to(analyze(packageJSON, process));
  process.send(data);
});

const analyze = async function(packageJSON, forkedProcess) {
  try {
    let depsData = [];

    let dependencies = {
      ...packageJSON.devDependencies,
      ...packageJSON.dependencies
    };

    let coordinates = [];

    for (let dep in dependencies) {
      forkedProcess.send(dep);

      coordinates.push(
        `pkg:npm/${dep}@${dependencies[dep].replace(/[\^~]/g, "")}`
      );

      let err, registryResponse, finalDepData;
      [err, registryResponse] = await to(
        axios.get(`https://registry.npmjs.org/${dep}/`)
      );

      if (err) {
        console.log("eRROr");
      } else {
        finalDepData = {
          ...registryResponse.data,
          ...{ isDev: dep in packageJSON.devDependencies }
        };
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
        finalDepData.github = issuesResponse.data;
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
    //
    // let err, ossData;
    // [err, ossData] = await to(getOssData(coordinates));

    return createCSVData(depsData, packageJSON);
  } catch (e) {
    console.log(e);
    // res.status(500).json({ error: "ERROR" });
    return "error";
  }
};

const getOssData = async coordinates => {
  console.log("COOR", coordinates);
  const auth = {
    user: process.env.OSS_INDEX_USER,
    pass: process.env.OSS_INDEX_TOKEN
  };

  let args = {
    body: { coordinates },
    json: true,
    auth
  };

  const baseUrl = `https://ossindex.sonatype.org/api/v3/component-report/`;

  client.post(baseUrl, args, function(err, response, json) {
    if (err) {
      console.error(err);
    }

    console.log(response.statusCode);
    console.log("WORKED", json);
  });
};

const createCSVData = (deps, packageJSON) => {
  const fields = ["name"];
  const opts = { fields };

  const dependencies = {
    ...packageJSON.devDependencies,
    ...packageJSON.dependencies
  };

  let data = deps.map(dep => {
    const currentProjectVersion = dependencies[dep.name].replace(/[\^~]/g, "");

    const currentProjectVersionWithSymbols = dependencies[dep.name];
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
      versionsBehindText: buildReleaseText(versionsBehind),
      currentProjectVersion,
      latestVersion: dep["dist-tags"].latest,
      timeSinceLastVersionRelease,
      lastReleaseDate,
      weeklyDownloads: dep.downloads.weekly.downloads
    };

    if ("open_issues_count" in dep) {
      dep.openIssuesAndPRs = dep.open_issues_count;
    }

    delete dep.readme;

    return { ...dep, ...result };
  });

  return data.sort((a, b) => {
    a = a ? a.name || "" : "";
    b = b ? b.name || "" : "";

    if (a > b) return 1;
    if (b > a) return -1;

    return 0;
  });
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
