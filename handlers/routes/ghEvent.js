const moment = require("moment");
const {
  forAxios,
  convertPackageJSONFromGitHub,
  calculateLevels
} = require("../../lib");
const { GitHub } = require("../../services");
const {
  analyzeSingleDependency
} = require("../../services/analyze/analyzeSingleDependency");
const { DepSnapshots, Installations } = require("../../models");

module.exports = async function(req, res) {
  const { action, installation, pull_request, repository } = req.body;
  console.log({ installation });
  await timeout(5000);
  console.log("GH Event -> ", action);
  switch (action) {
    case "created":
      await Installations.createInstallation(installation);
      break;
    case "opened":
    case "reopened":
      const InstallationApi = await GitHub.createInstallationApi(
        installation.id
      );

      const contentsUrl = repository.contents_url.replace(
        "{+path}",
        "package.json"
      );
      const { data: newBranchPackageJsonResponse } = await forAxios(
        InstallationApi.get(`${contentsUrl}?ref=${pull_request.head.ref}`)
      );

      const { data: oldBranchPackageJsonResponse } = await forAxios(
        InstallationApi.get(`${contentsUrl}`)
      );

      const newPackageJSON = convertPackageJSONFromGitHub(
        newBranchPackageJsonResponse.content
      );
      const oldPackageJSON = convertPackageJSONFromGitHub(
        oldBranchPackageJsonResponse.content
      );

      const newDeps = {
        ...newPackageJSON.dependencies,
        ...newPackageJSON.devDependencies
      };

      const oldDeps = {
        ...oldPackageJSON.dependencies,
        ...oldPackageJSON.devDependencies
      };

      const { results: diffDeps, versionDiffs } = findDiffs(oldDeps, newDeps);

      const newDepsData = [];
      for (let dep of diffDeps.new) {
        const depData = await analyzeDep(dep);
        newDepsData.push(depData);
      }

      const updatedDepsData = [];
      for (let dep of diffDeps.updated) {
        const depData = await analyzeDep(dep);
        updatedDepsData.push(depData);
      }

      /** Build Message */

      let newDepsMessage = [],
        updatedDepsMessage = [];

      if (newDepsData.length) {
        newDepsMessage = generateMessageFromDeps(
          newDepsData,
          true,
          versionDiffs
        );
      }

      if (updatedDepsData.length) {
        updatedDepsMessage = generateMessageFromDeps(
          updatedDepsData,
          false,
          versionDiffs
        );
      }

      const { data, error } = await forAxios(
        InstallationApi.post(pull_request.comments_url, {
          body: newDepsMessage.join("") + updatedDepsMessage.join("")
        })
      );
      break;
    default:
      return;
  }
};

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function findDiffs(oldDeps, newDeps) {
  // console.log(oldDeps, newDeps);
  const results = { new: [], updated: [] };
  const versionDiffs = {};

  for (let dep of Object.keys(newDeps)) {
    if (!(dep in oldDeps)) {
      results.new.push(dep);
    } else if (newDeps[dep] !== oldDeps[dep]) {
      results.updated.push(dep);
    }
    versionDiffs[dep] = { before: oldDeps[dep], after: newDeps[dep] };
  }

  return { results, versionDiffs };
}

async function analyzeDep(dep) {
  let existingData = await DepSnapshots.findRecentSnapshot(dep);
  if (existingData) {
    return existingData;
  } else {
    let { depData, npmData: tempNpmData } = await analyzeSingleDependency(dep);
    let singleDepData = depData;
    let npmData = tempNpmData;

    // use data to get severity levels
    singleDepData.levels = await calculateLevels(singleDepData);

    // save the snapshot to use next time
    if (singleDepData.npm) {
      await DepSnapshots.createDepSnapshot(singleDepData);
    }

    return singleDepData;
  }
}

// const emojis = [`😕`, `🤩`, `😃`, `😐`, `🤨`];
const emojis = [``, ``, ``, ``, ``];

function generateMessageFromDeps(deps, isNew, versionDiffs) {
  let MSG = [];

  MSG.push(
    `**${deps.length} ${isNew ? "new" : "updated"} ${
      deps.length > 1 ? "dependencies" : "dependency"
    }** for you to review.\n\n`
  );

  for (let dep of deps) {
    // let depMsg
    MSG.push(`**${dep.name}**`);
    MSG.push(` - ${dep.description}`);

    MSG.push("<br/>");
    MSG.push(`[NPM](${dep.links.npm}) | `);
    MSG.push(`[GitHub Repo](${dep.links.github})`);
    if (dep.links.homepage) {
      MSG.push(` | [Homepage](${dep.links.homepage})`);
    }
    MSG.push("<br/>");

    if (isNew) {
      MSG.push(
        `Latest Version: **${dep.versions.latest}** | Project (after PR): **${
          versionDiffs[dep.name].after
        }**`
      );
    } else {
      MSG.push(
        `Latest Version: **${dep.versions.latest}** | Project Version: **${
          versionDiffs[dep.name].before
        } -> ${versionDiffs[dep.name].after}**`
      );
    }

    MSG.push("<br/>");
    if (dep.deprecated) {
      MSG.push("<br/>");
      MSG.push(`⚠️⚠️ **This package is deprecated** ⚠️⚠️`);
      MSG.push("<br/>");
    }

    MSG.push(
      `\n- Last publish was ${moment(dep.time.modified).from(moment())} ${
        emojis[dep.levels.lastPublish]
      }`
    );

    if (dep.weeklyDownloads !== undefined) {
      MSG.push(
        `\n- ${dep.weeklyDownloads.toLocaleString("EN")} weekly downloads ${
          emojis[dep.levels.weeklyDownloads]
        }`
      );
    }

    if (dep.stars !== undefined) {
      MSG.push(
        `\n- ${dep.stars.toLocaleString("EN")} stars on Github ${
          emojis[dep.levels.stars]
        }`
      );
    }

    if (dep.license) {
      MSG.push(
        `\n- [${dep.license.name}](${dep.license.html_url}) ${
          emojis[dep.levels.license]
        }`
      );
    } else {
      MSG.push(`\n- Unknown license`);
    }

    if (dep.openIssues !== undefined) {
      MSG.push(
        `\n- ${dep.openIssues.toLocaleString(
          "EN"
        )} open issues and pull requests\n\n`
      );
    }

    MSG.push("\n\n");
    MSG.push("<br/>");
  }

  return MSG;
}
