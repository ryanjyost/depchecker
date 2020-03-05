module.exports = {
  getRepoUrlFromNpmRepoUrl: function(url) {
    let repoUrl = url.split("github.com/")[1].replace(".git", "");

    if (repoUrl.includes("/tree/")) {
      repoUrl = repoUrl.split("/tree/")[0];
    }

    return repoUrl;
  },

  initSingleDepData: function(depName) {
    const project = {
      version: null,
      versionsBehind: null,
      levels: null,
      release: null,
      size: {
        unpacked: {
          raw: null,
          formatted: ""
        }
      },
      deprecated: null
    };

    return {
      name: depName,
      description: depName,
      deprecated: false,
      ["dist-tags"]: null,
      stars: -1,
      license: null,
      openIssues: -1,
      weeklyDownloads: -1,
      levels: null,
      links: {
        registry: `https://registry.npmjs.org/${depName}`,
        npm: `https://npmjs.org/${depName}`,
        homepage: null,
        github: null
      },
      downloads: {
        weekly: -1
      },
      versions: {
        latest: null
      },
      time: {
        modified: null,
        created: null,
        latest: null
      },
      size: {
        unpacked: {
          raw: null,
          formatted: ""
        },
        zip: {
          raw: null,
          formatted: ""
        }
      },
      npm: null,
      project,
    };
  }
};
