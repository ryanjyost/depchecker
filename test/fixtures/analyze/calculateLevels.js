const moment = require("moment");
module.exports = {
  versionsBehind: {
    unknown: { text: "Unknown", major: -1, minor: -1, patch: -1 },
    upToDate: { text: "Up to date", major: 0, minor: 0, patch: 0 },
    patchBehind: { text: "1 patch", major: 0, minor: 0, patch: 1 },
    minorBehind: { text: "1 minor", major: 0, minor: 1, patch: 1 },
    majorBehind: { text: "1 major", major: 1, minor: 1, patch: 1 }
  },
  lastPublish: {
    moreThanAYearAgo: moment()
      .subtract(2, "year")
      .toISOString(),
    moreThan6MonthsAgo: moment()
      .subtract(7, "month")
      .toISOString(),
    moreThan2MonthsAgo: moment()
      .subtract(3, "month")
      .toISOString(),
    veryRecently: moment()
      .subtract(2, "second")
      .toISOString()
  },
  downloads: {
    bad: 1000 - 1,
    warning: 10000 - 1,
    fine: 100000 - 1,
    good: 1000000 - 1
  },
  stars: {
    bad: 50 - 1,
    warning: 300 - 1,
    fine: 1000 - 1,
    good: 1000
  },
  license: {
    mit: { key: "mit", name: "MIT" },
    gnu: { key: "gnu", name: "GNU TYPE THING" },
    bsd2: { key: "bsd-2-clause", name: 'BSD 2-Clause "Simplified" License' }
  }
};
