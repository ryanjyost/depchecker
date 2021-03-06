module.exports = {
  authorize: require("./authorize"),
  addInstallation: require("./addInstallation"),
  getInstallationRepos: require("./getInstallationRepos"),
  updateInstallationRepos: require("./updateInstallationRepos"),
  readPackageJSON: require("./readPackageJSON"),
  setupNewInstallation: require("./setupNewInstallation"),
  followTheStars: require("./followTheStars"),
  unsubscribe: require("./unsubscribeFromFollowTheStars"),
  ghEvent: require("./ghEvent")
};
