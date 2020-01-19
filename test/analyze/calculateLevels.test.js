const { expect } = require("chai");
const { levelMethods } = require("../../lib/analyze/calculateLevels");
const { severityLevels } = require("../../constants");
const fixtures = require("../fixtures/analyze/calculateLevels");
const { NA, GOOD, FINE, WARNING, BAD } = severityLevels;

describe("levelMethods", function() {
  describe("versionsBehind()", function() {
    it("should return NA if null", function() {
      expect(levelMethods.versionsBehind(null)).to.equal(NA);
    });

    it("should return NA if empty object", function() {
      expect(levelMethods.versionsBehind(null)).to.equal(NA);
    });

    it("should return NA if unknown", function() {
      expect(
        levelMethods.versionsBehind(fixtures.versionsBehind.unknown)
      ).to.equal(NA);
    });

    it("should return GOOD if up to date", function() {
      expect(
        levelMethods.versionsBehind(fixtures.versionsBehind.upToDate)
      ).to.equal(GOOD);
    });

    it("should return FINE if patch behind", function() {
      expect(
        levelMethods.versionsBehind(fixtures.versionsBehind.patchBehind)
      ).to.equal(FINE);
    });

    it("should return WARNING if minor behind", function() {
      expect(
        levelMethods.versionsBehind(fixtures.versionsBehind.minorBehind)
      ).to.equal(WARNING);
    });

    it("should return BAD if major behind", function() {
      expect(
        levelMethods.versionsBehind(fixtures.versionsBehind.majorBehind)
      ).to.equal(BAD);
    });
  });

  describe("lastPublish()", function() {
    it("should return NA if no time provided", function() {
      expect(levelMethods.versionsBehind(null)).to.equal(NA);
    });

    it("should return GOOD if more than a year ago", function() {
      expect(
        levelMethods.lastPublish(fixtures.lastPublish.moreThanAYearAgo)
      ).to.equal(BAD);
    });

    it("should return WARNING if more than 6 months ago", function() {
      expect(
        levelMethods.lastPublish(fixtures.lastPublish.moreThan6MonthsAgo)
      ).to.equal(WARNING);
    });

    it("should return FINE if more than 2 months ago", function() {
      expect(
        levelMethods.lastPublish(fixtures.lastPublish.moreThan2MonthsAgo)
      ).to.equal(FINE);
    });

    it("should return GOOD if very recently", function() {
      expect(
        levelMethods.lastPublish(fixtures.lastPublish.veryRecently)
      ).to.equal(GOOD);
    });
  });

  describe("weeklyDownloads()", function() {
    it("should return NA if not a number", function() {
      expect(levelMethods.weeklyDownloads(undefined)).to.equal(NA);
    });

    it("should return NA if a string", function() {
      expect(levelMethods.weeklyDownloads({})).to.equal(NA);
    });

    it("should return BAD if less than 1,000", function() {
      expect(levelMethods.weeklyDownloads(fixtures.downloads.bad)).to.equal(
        BAD
      );
    });

    it("should return WARNING if less than 10,000", function() {
      expect(levelMethods.weeklyDownloads(fixtures.downloads.warning)).to.equal(
        WARNING
      );
    });

    it("should return FINE if less than 100,000", function() {
      expect(levelMethods.weeklyDownloads(fixtures.downloads.fine)).to.equal(
        FINE
      );
    });

    it("should return GOOD if more than 100,000", function() {
      expect(levelMethods.weeklyDownloads(fixtures.downloads.good)).to.equal(
        GOOD
      );
    });
  });

  describe("stars()", function() {
    it("should return NA if no stars provided", function() {
      expect(levelMethods.stars(undefined)).to.equal(NA);
    });

    it("should return NA if not a number", function() {
      expect(levelMethods.stars("5dds")).to.equal(NA);
    });

    it("should return BAD less than 50 stars", function() {
      expect(levelMethods.stars(fixtures.stars.bad)).to.equal(BAD);
    });

    it("should return WARNING less than 300 stars", function() {
      expect(levelMethods.stars(fixtures.stars.warning)).to.equal(WARNING);
    });

    it("should return FINE less than 1000 stars", function() {
      expect(levelMethods.stars(fixtures.stars.fine)).to.equal(FINE);
    });

    it("should return GOOD 1000 stars or more", function() {
      expect(levelMethods.stars(fixtures.stars.good)).to.equal(GOOD);
    });
  });

  describe("license()", function() {
    it("should return NA nothing provided", function() {
      expect(levelMethods.license(null)).to.equal(NA);
    });

    it("should return NA empty object", function() {
      expect(levelMethods.license({})).to.equal(NA);
    });

    it("should return GOOD if just MIT string", function() {
      expect(levelMethods.license("MIT")).to.equal(GOOD);
    });

    it("should return GOOD if MIT", function() {
      expect(levelMethods.license(fixtures.license.mit)).to.equal(GOOD);
    });

    it("should return BAD if GNU", function() {
      expect(levelMethods.license(fixtures.license.gnu)).to.equal(BAD);
    });

    it("should return FINE if something else", function() {
      expect(levelMethods.license(fixtures.license.bsd2)).to.equal(FINE);
    });
  });
});
