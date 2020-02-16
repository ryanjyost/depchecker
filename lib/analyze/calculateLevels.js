const moment = require("moment");
const _ = require("lodash");
const { severityLevels } = require("../../constants");

const { NA, GOOD, FINE, WARNING, BAD } = severityLevels;

function calculateLevels(data) {
  const levels = {
    versionsBehind: NA,
    lastPublish: NA,
    weeklyDownloads: NA,
    stars: NA,
    license: NA
  };

  levels.versionsBehind = levelMethods.versionsBehind(data.versionsBehind);
  levels.lastPublish = levelMethods.lastPublish(data.time && data.time.latest);
  levels.weeklyDownloads = levelMethods.weeklyDownloads(data.weeklyDownloads);
  levels.stars = levelMethods.stars(data.stars);
  levels.license = levelMethods.license(data.license);

  return levels;
}

const levelMethods = {
  versionsBehind: data => {
    if (!data || _.isEmpty(data)) return NA;

    if (data.major > 0) {
      return BAD;
    } else if (data.minor > 0) {
      return WARNING;
    } else if (data.patch > 0) {
      return FINE;
    } else if (data.patch === 0) {
      return GOOD;
    }

    return NA;
  },

  lastPublish: lastPublishISOString => {
    if (!lastPublishISOString) return NA;
    const date = moment(lastPublishISOString);

    if (Math.abs(date.diff(moment(), "years")) > 0) {
      return BAD;
    } else if (Math.abs(date.diff(moment(), "months")) > 6) {
      return WARNING;
    } else if (Math.abs(date.diff(moment(), "months")) > 2) {
      return FINE;
    } else if (Math.abs(date.diff(moment(), "second")) > 1) {
      return GOOD;
    }

    return NA;
  },

  weeklyDownloads: downloads => {
    if ((!downloads || isNaN(downloads) || downloads < 0) && downloads !== 0) {
      return NA;
    }

    if (downloads < 1000) {
      return BAD;
    } else if (downloads < 10000) {
      return WARNING;
    } else if (downloads < 100000) {
      return FINE;
    }
    return GOOD;
  },

  stars: stars => {
    if ((!stars || isNaN(stars) || stars < 0) && stars !== 0) return NA;

    if (stars < 50) {
      return BAD;
    } else if (stars < 300) {
      return WARNING;
    } else if (stars < 1000) {
      return FINE;
    }

    return GOOD;
  },

  license: license => {
    if (!license || _.isEmpty(license)) return NA;

    if (typeof license === "object" && "key" in license) {
      if (license.key === "other") {
        return WARNING;
      } else if (license.key === "mit") {
        return GOOD;
      } else if (license.name && license.name.includes("GNU")) {
        return BAD;
      } else {
        return FINE;
      }
    } else {
      if (license === "MIT") {
        return GOOD;
      }
    }

    return BAD;
  }
};

exports.calculateLevels = calculateLevels;
exports.levelMethods = levelMethods;
