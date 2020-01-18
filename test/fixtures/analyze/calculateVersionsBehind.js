const unknownOutput = {
  text: "Unknown",
  major: -1,
  minor: -1,
  patch: -1
};

module.exports = {
  gibberish: {
    project: "^f.b.s",
    latest: "^3.111111.a",
    output: unknownOutput
  },
  badPatch: {
    project: "1.0.7",
    latest: "1.0.0-beta.16",
    output: {
      text: "Unknown",
      major: 0,
      minor: 0,
      patch: -1
    }
  },
  patchesBehind: {
    project: "13.2.3",
    latest: "13.2.6",
    output: {
      text: "3 patches",
      major: 0,
      minor: 0,
      patch: 3
    }
  },
  minorsBehind: {
    project: "13.2.3",
    latest: "13.4.6",
    output: {
      text: "2 minors",
      major: 0,
      minor: 2,
      patch: 3
    }
  },
  majorsBehind: {
    project: "13.2.3",
    latest: "17.4.6",
    output: {
      text: "4 majors",
      major: 4,
      minor: 2,
      patch: 3
    }
  },
  upToDate: {
    project: "17.4.6",
    latest: "17.4.6",
    output: {
      text: "Up to date",
      major: 0,
      minor: 0,
      patch: 0
    }
  }
};
