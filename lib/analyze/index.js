module.exports = {
  ...{
    gatherMetaFromPackageJson: require("./gatherMetaFromPackageJson"),
    calculateLevels: require("./calculateLevels").calculateLevels,
    levelMethods: require("./calculateLevels").levelMethods,
    calculateVersionsBehind: require("./calculateVersionsBehind"),
    getLicenseData: require("./getLicenseData"),
    summarizeAnalysis: require("./summarizeAnalysis"),
    analyzeInstallation: require("./analyzeInstallation")
  },
  ...require("./misc")
};
