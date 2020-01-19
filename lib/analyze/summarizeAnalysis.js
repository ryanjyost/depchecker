const { severityLevels } = require("../../constants");

/**
 * Take array of analyzed deps and sum up metric severities
 * @param {Array} data
 * @returns {Object} Summary of metrics by severity level
 */
module.exports = function(data) {
  const metricBase = [];

  for (let level in severityLevels) {
    metricBase[severityLevels[level]] = 0;
  }

  const summary = {
    versionsBehind: [...metricBase],
    lastPublish: [...metricBase],
    weeklyDownloads: [...metricBase],
    stars: [...metricBase],
    license: [...metricBase]
  };

  for (let dep of data) {
    const { levels } = dep;
    for (let metric of Object.keys(summary)) {
      if (levels[metric]) {
        const depLevel = levels[metric];
        summary[metric][depLevel] = summary[metric][depLevel] + 1;
      }
    }
  }

  console.log("SUMMARY", summary);
  return summary;
};
