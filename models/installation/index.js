const Installation = require("./model");

module.exports = {
  createInstallation: async data => {
    try {
      const installation = await Installation.create({
        githubId: data.id,
        repos: [],
        account: {
          id: data.account.id,
          login: data.account.login,
          type: data.account.type
        }
      });

      if (!installation) throw Error();
      return installation;
    } catch (e) {
      return Installation.findOne({ githubId: data.id });
    }
  },
  findInstallation: async githubId => {
    return await Installation.findOne({ githubId });
  },
  updateInstallationRepos: async (githubId, repos) => {
    return Installation.findOneAndUpdate(
      { githubId },
      { $set: { repos } },
      { new: true }
    );
  },
  getInstallationFromLogin: async login => {
    return await Installation.findOne({ "account.login": login });
  }

  // 	return await Group.findOneAndUpdate(groupQuery, {
  // 	$push: { members: userId }
  // });
};
