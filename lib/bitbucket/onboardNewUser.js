const to = require("../helpers/to.js");
const axios = require("axios");

const Repository = require("../../models/repository.js");
const Dependency = require("../../models/dependency.js");

module.exports = async function(req, res, next) {
  const Bitbucket = require("./index");
  const BitbucketApi = Bitbucket.createApi(req.body.access_token);
  const user = req.body.user;
  const repos = req.body.repos;

  let depData = [];

  for (let repo of repos) {
    let singleRepoData, err;
    [err, singleRepoData] = await to(
      BitbucketApi.get(
        `repositories/${user.username}/${repo.name}/src/HEAD/package.json`
      )
    );

    let newRepo;
    [err, newRepo] = await to(
      Repository.create({
        name: singleRepoData.name,
        packageJSON: singleRepoData.data,
        bitbucket: repo
      })
    );

    depData.push({ ...singleRepoData.data, ...{ repo: repo } });
  }

  let combined = [];

  for (let repo of depData) {
    let singleDeps = [];
    for (let dependency in repo.dependencies) {
      let err, data;
      // let dep = await shell(`npm view ${dependency} description -json`);
      [err, data] = await to(
        axios.get(`https://registry.npmjs.org/${dependency}/`)
      );

      let newDep;
      [err, newDep] = await to(
        Dependency.create({
          name: data.data.name,
          description: data.data.description
          // npm: data.data
        })
      );

      singleDeps.push(data.data);
    }
    combined.push({ ...{ deps: singleDeps, ...repo } });
  }

  res.json({
    repos: combined,
    depData: depData
  });
};
