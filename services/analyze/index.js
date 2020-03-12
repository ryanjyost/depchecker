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
      console.log("===========");
      console.log({ dep });

      // let existingData = await DepSnapshots.findRecentSnapshot(dep);
      let existingData = null;

      let singleDepData, npmData;

      if (existingData) {
        console.log("Use existing!", dep);
        singleDepData = existingData;
      } else {
        const isDev =
          packageJSON.devDependencies && dep in packageJSON.devDependencies;

        // gather bunch of info about the dep
        let { depData, npmData: tempNpmData } = await analyzeSingleDependency(
          dep,
          isDev
        );
        singleDepData = depData;
        npmData = tempNpmData;

        // use data to get severity levels
        singleDepData.levels = await calculateLevels(singleDepData);

        // save the snapshot to use next time
        if (singleDepData.npm) {
          await DepSnapshots.createDepSnapshot(singleDepData);
        }
      }

      // add project-specific data
      const projectVersion = dependencies[dep];
      const cleanProjectVersion = projectVersion.replace(/[\^~]/g, "");
      singleDepData.project = getProjectData(singleDepData, projectVersion);

      if (
        npmData &&
        npmData.versions &&
        npmData.versions[cleanProjectVersion]
      ) {
        singleDepData.project.size = getSizeData(
          npmData.versions[cleanProjectVersion]
        );
      }

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

    const sortedDeps = depsData.sort((a, b) => {
      a = a ? a.name || "" : "";
      b = b ? b.name || "" : "";

      if (a > b) return 1;
      if (b > a) return -1;

      return 0;
    });

    if (!forkedProcess) {
      return {
        deps: sortedDeps,
        summary: analysisSummary
      };
    }

    return sortedDeps;
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
    return {
      ...project,
      ...{
        versionsBehind: calculateVersionsBehind(
          projectVersion,
          depData.npm["dist-tags"].latest
        ),
        release: depData.npm.time[projectVersion]
      }
    };
  }

  return project;
}
