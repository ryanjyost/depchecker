const qs = require("qs");
const { GitHub } = require("../../services");
const { Installations } = require("../../models");
const { Helpers } = require("../../lib");
const { forAxios } = Helpers;

module.exports = async function(req, res) {
  const { code } = req.body;
  const {
    data: { access_token, error: accessTokenError }
  } = await forAxios(GitHub.getUserAccessToken(code));

  if (!access_token) {
    res.status(401).json({ error: accessTokenError });
  }

  const UserApi = GitHub.createUserApi(access_token);

  const { data, error: getUserError } = await UserApi.getUser();
  if (!data.login) {
    res.status(401).json({ error: getUserError });
  }

  const installation = await Installations.getInstallationFromLogin(data.login);

  res.status(200).json({ response: { installation } });
};
