module.exports = function(projectVersion, latest) {
  let text = "";

  const currentProjectVersion = projectVersion.replace(/[\^~]/g, "");

  const levels = currentProjectVersion.split(".");
  const currentVersionBreakdown = {
    major: Number(levels[0]),
    minor: Number(levels[1]),
    patch: Number(levels[2])
  };

  const mostRecentReleaseBreakdown = {
    major: Number(latest.split(".")[0]),
    minor: Number(latest.split(".")[1]),
    patch: Number(latest.split(".")[2])
  };

  const versionsBehind = {
    major: mostRecentReleaseBreakdown.major - currentVersionBreakdown.major,
    minor: mostRecentReleaseBreakdown.minor - currentVersionBreakdown.minor,
    patch: mostRecentReleaseBreakdown.patch - currentVersionBreakdown.patch
  };

  if (
    versionsBehind.major === 0 &&
    versionsBehind.minor === 0 &&
    versionsBehind.patch === 0
  ) {
    text = "Up to date";
  } else {
    if (versionsBehind.major > 0) {
      text = `${
        versionsBehind.major > 0
          ? `${versionsBehind.major} major${
              versionsBehind.major === 1 ? "" : "s"
            }`
          : ""
      }  `;
    } else if (versionsBehind.minor > 0) {
      text = `${
        versionsBehind.minor > 0
          ? `${versionsBehind.minor} minor${
              versionsBehind.minor === 1 ? "" : "s"
            }`
          : ""
      }  `;
    } else if (versionsBehind.patch > 0) {
      text = `${
        versionsBehind.patch > 0
          ? `${versionsBehind.patch} patch${
              versionsBehind.patch === 1 ? "" : "es"
            }`
          : ""
      }  `;
    } else {
      text = "Up to date";
    }
  }

  return { ...{ text: text.trim() }, ...versionsBehind };
};
