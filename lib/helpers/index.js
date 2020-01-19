module.exports = {
  to: require("./to"),
  forAxios: require("./forAxios"),
  catchErrors: require("./catchErrors"),
  convertPackageJSONFromGitHub: function(content) {
    const buff = new Buffer(content, "base64");
    const packageJSON = JSON.parse(buff.toString());

    return {
      name: packageJSON.name,
      dependencies: packageJSON.dependencies,
      devDependencies: packageJSON.devDependencies
    };
  },
  extractRepoDetailsFromUrl(url) {
    try {
      const details = url.replace("https://github.com/", "").split("/");
      return {
        owner: details[0],
        repo: details[1]
      };
    } catch (e) {
      return null;
    }
  }
};
