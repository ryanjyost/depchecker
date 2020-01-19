module.exports = function(projectVersion, latest) {
  try {
    const currentProjectVersion = projectVersion.replace(/[\^~]/g, "");

    const [
      currentMajor,
      currentMinor,
      currentPatch
    ] = currentProjectVersion.split(".");

    const currentVersionBreakdown = {
      major: processVersionNumber(currentMajor),
      minor: processVersionNumber(currentMinor),
      patch: processVersionNumber(currentPatch)
    };

    const latestVersion = latest.replace(/[\^~]/g, "");
    const [latestMajor, latestMinor, latestPatch] = latestVersion.split(".");

    const mostRecentReleaseBreakdown = {
      major: processVersionNumber(latestMajor),
      minor: processVersionNumber(latestMinor),
      patch: processVersionNumber(latestPatch)
    };

    const versionsBehind = {
      major: calcVersionDiff(
        mostRecentReleaseBreakdown.major,
        currentVersionBreakdown.major
      ),
      minor: calcVersionDiff(
        mostRecentReleaseBreakdown.minor,
        currentVersionBreakdown.minor
      ),
      patch: calcVersionDiff(
        mostRecentReleaseBreakdown.patch,
        currentVersionBreakdown.patch
      )
    };

    let text = "";
    if (
      versionsBehind.major === 0 &&
      versionsBehind.minor === 0 &&
      versionsBehind.patch === 0
    ) {
      text = "Up to date";
    } else {
      if (versionsBehind.major > 0) {
        text = `${versionsBehind.major} major${
          versionsBehind.major === 1 ? "" : "s"
        }`;
      } else if (versionsBehind.minor > 0) {
        text = `${versionsBehind.minor} minor${
          versionsBehind.minor === 1 ? "" : "s"
        }`;
      } else if (versionsBehind.patch > 0) {
        text = `${versionsBehind.patch} patch${
          versionsBehind.patch === 1 ? "" : "es"
        }`;
      } else {
        text = "Unknown";
      }
    }

    return { ...{ text: text.trim() }, ...versionsBehind };
  } catch (e) {
    return {
      text: "Unknown",
      major: -1,
      minor: -1,
      patch: -1
    };
  }
};

function processVersionNumber(num) {
  if (isNaN(num)) return -1;
  return Number(num);
}

function calcVersionDiff(latest, project) {
  if (latest < 0 || project < 0) return -1;
  return Math.max(latest - project, 0);
}
