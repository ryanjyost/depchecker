const { summarizeAnalysis, calculateLevels } = require("../../lib");

const analyzeSingleDependency = require("./analyzeSingleDependency");
const applyProjectData = require("./applyProjectData");

async function analyze(packageJSON, forkedProcess) {
  try {
    let depsData = [];

    const dependencies = {
      ...packageJSON.devDependencies,
      ...packageJSON.dependencies
    };

    for (let dep in dependencies) {
      const projectVersion = dependencies[dep];
      const isDev =
        packageJSON.devDependencies && dep in packageJSON.devDependencies;

      const singleDepData = await analyzeSingleDependency(
        dep,
        projectVersion,
        isDev
      );

      singleDepData.levels = calculateLevels(singleDepData);
      singleDepData.project.levels = singleDepData.levels.versionsBehind;

      if (forkedProcess) {
        forkedProcess.send({ type: "singleDepData", data: singleDepData });
      }

      // // apply project specific data
      // const dataWithProjectSpecifics = await applyProjectData(singleDepData);
      // singleDepData.versions.project = dependencies[dep];
      // // DEP_DATA.time.project = npmData.time[dependencies[dep].replace(/[\^~]/g, "")];
      // dataWithProjectSpecifics.levels = calculateLevels(singleDepData);

      depsData.push(singleDepData);
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
