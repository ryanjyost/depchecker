module.exports = {
  ...{
    gatherMetaFromPackageJson: require("./gatherMetaFromPackageJson"),
    calculateLevels: require("./calculateLevels").calculateLevels,
    calculateVersionsBehind: require("./calculateVersionsBehind"),
    getLicenseData: require("./getLicenseData"),
    summarizeAnalysis: require("./summarizeAnalysis")
  },
  ...require("./misc")
};
