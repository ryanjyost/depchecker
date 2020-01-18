const { expect } = require("chai");
const { getRepoUrlFromNpmRepoUrl } = require("../../lib/analyze/misc");

describe("misc", function() {
  describe("getRepoUrlFromNpmRepoUrl()", function() {
    it("should work", function() {
      expect(
        getRepoUrlFromNpmRepoUrl(
          "git+https://github.com/facebook/create-react-app.git"
        )
      ).to.equal("facebook/create-react-app");
    });
  });
});
