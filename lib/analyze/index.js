module.exports = {
  ...{
    gatherMetaFromPackageJson: require("./gatherMetaFromPackageJson"),
    calculateLevels: require("./calculateLevels"),
    calculateVersionsBehind: require("./calculateVersionsBehind"),
    getLicenseData: require("./getLicenseData")
  },
  ...require("./misc")
};
