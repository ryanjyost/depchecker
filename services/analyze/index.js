const mongoose = require("mongoose");
const {
  summarizeAnalysis,
  calculateLevels,
  calculateVersionsBehind,
  levelMethods
} = require("../../lib");
const {
  analyzeSingleDependency,
  getSizeData
} = require("./analyzeSingleDependency");
const { DepSnapshots } = require("../../models");

async function analyze(packageJSON, forkedProcess) {
  await mongoose.connect(process.env.DB_URL, { useNewUrlParser: true });
  try {
    let depsData = [];

    const dependencies = {
      ...packageJSON.devDependencies,
      ...packageJSON.dependencies
    };

    for (let dep in dependencies) {
      const recentDepSnapshot = await DepSnapshots.findRecentSnapshot(dep);
      console.log("RECENT", recentDepSnapshot);

      const isDev =
        packageJSON.devDependencies && dep in packageJSON.devDependencies;

      // gather bunch of info about the dep
      const singleDepData = await analyzeSingleDependency(dep, isDev);

      // use data to get severity levels
      singleDepData.levels = calculateLevels(singleDepData);

      // save the snapshot to use next time
      await DepSnapshots.createDepSnapshot(singleDepData);

      // add project-specific data
      const projectVersion = dependencies[dep];
      singleDepData.project = getProjectData(singleDepData, projectVersion);
      singleDepData.project.levels = levelMethods.versionsBehind(
        singleDepData.project.versionsBehind
      );
      singleDepData.levels.versionsBehind = singleDepData.project.levels;

      // emit new info to the client
      if (forkedProcess) {
        forkedProcess.send({ type: "singleDepData", data: singleDepData });
      }

      depsData.push(singleDepData);
    }

    // take all analyzed deps and summarize by severity levels
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

function getProjectData(depData, rawProjectVersion) {
  const projectVersion = rawProjectVersion.replace(/[\^~]/g, "");

  let project = {
    rawProjectVersion,
    version: projectVersion,
    versionsBehind: null,
    release: null,
    size: null,
    deprecated: null
  };

  if (depData.npm) {
    // const projectVersionNpmData = depData.npm.versions[projectVersion];
    return {
      ...project,
      ...{
        versionsBehind: calculateVersionsBehind(
          projectVersion,
          depData.npm["dist-tags"].latest
        ),
        release: depData.npm.time[projectVersion],
        // size: getSizeData(depData.npm, projectVersion),
        // deprecated: projectVersionNpmData.deprecated || false
      }
    };
  }

  return project;
}
