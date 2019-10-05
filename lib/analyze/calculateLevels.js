const moment = require("moment");

module.exports = data => {
  // 0 = good
  // 1 = fine
  // 2 = warning
  // 3 = bad
  // -1 = N/A

  const levels = {
    versionsBehind: -1,
    lastPublish: -1,
    weeklyDownloads: -1,
    stars: -1,
    license: -1
  };

  levels.versionsBehind = levelMethods.versionsBehind(data.versionsBehind);
  levels.lastPublish = levelMethods.lastPublish(data.time);
  levels.weeklyDownloads = levelMethods.weeklyDownloads(data.weeklyDownloads);
  levels.stars = levelMethods.stars(data.stars);
  levels.license = levelMethods.license(data.license);

  return levels;
};

const levelMethods = {
  versionsBehind: data => {
    if (!data) return -1;
    if (data.major > 0) {
      return 3;
    } else if (data.minor > 0) {
      return 2;
    } else if (data.patch > 0) {
      return 1;
    }
    return 0;
  },
  lastPublish: data => {
    if (!data.latest) return null;
    const date = moment(data.latest);
    if (Math.abs(date.diff(moment(), "years")) > 0) {
      return 3;
    } else if (Math.abs(date.diff(moment(), "months")) > 6) {
      return 2;
    } else if (Math.abs(date.diff(moment(), "months")) > 2) {
      return 1;
    }
    return 0;
  },
  weeklyDownloads: downloads => {
    if (downloads < 1000) {
      return 3;
    } else if (downloads < 10000) {
      return 2;
    } else if (downloads < 100000) {
      return 1;
    }
    return 0;
  },
  stars: stars => {
    if (stars < 50) {
      return 3;
    } else if (stars < 300) {
      return 2;
    } else if (stars < 1000) {
      return 1;
    }

    return 0;
  },
  license: license => {
    if (!license) return -1;

    if (typeof license === "object" && "conditions" in license) {
      if (license.key === "mit") {
        return 0;
      } else if (license.name.includes("GNU")) {
        return 3;
      } else {
        return 1;
      }
    } else {
      if (license === "MIT") {
        return 0;
      }
    }

    return 4;
  }
};
