const { GitHub } = require("../../services");

/**
 * POST /read_package_json
 * Read a json file and return object
 */
module.exports = async function(req, res) {
  if (req.files) {
    res.json(JSON.parse(req.files.file.data));
  } else {
    let url = req.repoURL;
    const packageJSON = await GitHub.getPackageJSONFromRepoUrl(url);
    res.json(packageJSON);
  }
};
