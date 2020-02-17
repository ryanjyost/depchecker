const { GitHub } = require("../../services");
const { Installations } = require("../../models");
const { forAxios } = require("../../lib");

module.exports = async function(req, res) {
  try {
    // code to exchange for access token
    const { code } = req.body;

    // fetch the access token from GH
    const {
      data: { access_token, error: accessTokenError }
    } = await forAxios(GitHub.getUserAccessToken(code));

    if (!access_token) {
      return res.status(401).json({ error: accessTokenError });
    }

    // init user-authed api
    const UserApi = GitHub.createUserApi(access_token);

    // get the user's info - need their login to look for existing installations in database
    const { data, error: getUserError } = await UserApi.getUser();

    // hmm, something wrong getting user's info
    if (!data.login) {
      res.status(400).json({ error: getUserError });
    }

    // return any existing DepChecker installation associated with the user being authed
    let installation = await Installations.getInstallationFromLogin(data.login);

    // No installation in DepChecker database? Get installation info from GH and create record
    if (!installation) {
      // app api will let us look for installation installed by current user
      const AppApi = await GitHub.createApi();
      const { data: installationData } = await forAxios(
        AppApi.getUserInstallation(data.login)
      );

      // create the record
      installation = await Installations.createInstallation({
        githubId: installationData.id,
        repos: [],
        account: {
          id: installationData.account.id,
          login: installationData.account.login,
          type: installationData.account.type
        }
      });
    }

    res.status(200).json({ response: { installation } });
  } catch (e) {
    console.log(e);
  }
};
