const Installation = require("./model");

module.exports = {
  createInstallation: async data => {
    try {
      const installation = await Installation.create(data);
      return installation;
    } catch (e) {
      return await Installation.findOne({ githubId: data.githubId });
    }
  },
  findInstallation: async githubId => {
    return await Installation.findOne({ githubId });
  },
  updateInstallationRepos: async (githubId, repos) => {
    return await Installation.findOneAndUpdate(
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
