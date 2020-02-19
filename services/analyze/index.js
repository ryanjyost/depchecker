const { summarizeAnalysis } = require("../../lib");

const analyzeSingleDependency = require("./analyzeSingleDependency");

async function analyze(packageJSON, forkedProcess) {
  try {
    let depsData = [];

    const dependencies = {
      ...packageJSON.devDependencies,
      ...packageJSON.dependencies
    };

    for (let dep in dependencies) {
      const singleDepData = await analyzeSingleDependency(
        dep,
        packageJSON,
        forkedProcess
      );
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
