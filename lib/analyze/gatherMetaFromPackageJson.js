module.exports = function(packageJson) {
  let deps = { ...packageJson.dependencies };
  let devDeps = packageJson.devDependencies
    ? { ...packageJson.devDependencies }
    : {};
  let totalDeps = Object.keys(deps).length;
  let totalDevDeps = Object.keys(devDeps).length;

  return {
    deps: {
      deps: Object.keys(deps),
      devDeps: Object.keys(devDeps),
      all: [...Object.keys(deps), ...Object.keys(devDeps)]
    },
    totals: {
      deps: totalDeps,
      devDeps: totalDevDeps,
      all: totalDeps + totalDevDeps
    }
  };
};
