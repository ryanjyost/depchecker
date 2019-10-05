const express = require("express");
const router = express.Router();
const to = require("../lib/helpers/to.js");
const axios = require("axios");
const analyze = require("../lib/analyze/analyze");

const { Installations } = require("../models");
const { GitHub } = require("../services");
const Handlers = require("../handlers");

router.get("/", (req, res) => {
  res.send({ response: "I am alive" }).status(200);
});

router.post("/auth", Handlers.routes.authorize);

router.post("/read_package_json", async function(req, res) {
  if (req.files) {
    res.json(JSON.parse(req.files.file.data));
  } else {
    let url = req.repoURL;
    if (url === "string") {
      const githubURL = `${url.replace(
        "https://github.com",
        "https://api.github.com/repos"
      )}/contents/package.json?client_id=${
        process.env.GITHUB_CLIENT_ID
      }&client_secret=${process.env.GITHUB_CLIENT_SECRET}`;

      let [err, response] = await to(axios.get(githubURL));

      const buff = new Buffer(response.data.content, "base64");
      let packageJSON = JSON.parse(buff.toString());
      res.json(packageJSON);
    }
  }
});

router.get("/installations/:installationId", async (req, res) => {
  try {
    const installationId = req.params.installationId;
    const installation = await Installations.findInstallation(installationId);
    console.log("BODY", req.body);
    res.send({ response: { installation } }).status(200);
  } catch (e) {
    console.log("ERROR", e);
    res.json({});
  }
});

router.post("/installations", async (req, res) => {
  try {
    const { installationId } = req.body;
    const AppApi = await GitHub.createApi();

    let err, response;
    [err, response] = await to(
      AppApi.get(`/app/installations/${installationId}`)
    );
    if (err) console.log(err);

    const installation = await Installations.createInstallation({
      githubId: installationId,
      repos: [],
      account: {
        id: response.data.account.id,
        login: response.data.account.login,
        type: response.data.account.type
      }
    });

    // console.log("BODY", req.body);
    res.status(200).json({ response: { installation } });
  } catch (e) {
    console.log("ERROR", e);
    res.status(500).json({ error: e });
  }
});

router.get("/installations/:installationId/repos", async (req, res) => {
  const { installationId } = req.params;
  try {
    const InstallationApi = await GitHub.createInstallationApi(installationId);
    const reposResponse = await InstallationApi.get(
      `/installation/repositories`
    );

    res
      .json({
        response: {
          repos: reposResponse.data.repositories
        }
      })
      .status(200);
  } catch (e) {
    console.log(e);
  }
});

router.put("/installations/:installationid", async (req, res) => {
  const installationId = req.params.installationid;
  const { repos } = req.body;

  const updatedInstallation = await Installations.updateInstallationRepos(
    installationId,
    repos
  );

  res.status(200).json({ response: { installation: updatedInstallation } });
});

router.post("/installations/:installationId/analyze", async (req, res) => {
  const installationId = req.params.installationId;

  const installation = await Installations.findInstallation(installationId);
  const InstallationApi = await GitHub.createInstallationApi(installationId);

  const allRepos = [];

  for (let repo of installation.repos) {
    console.log("=============", repo, "=============");
    let err, response;
    [err, response] = await to(
      InstallationApi.get(
        `/repos/${installation.account.login}/${
          repo.name
        }/contents/package.json`
      )
    );
    if (err) console.error("ERRRRR", err);
    const buff = new Buffer(response.data.content, "base64");
    let packageJSON = JSON.parse(buff.toString());
    const result = await analyze(packageJSON);
    allRepos.push({ ...{ ts: Date.now(), analysis: result }, ...repo });
  }

  const updatedInstallation = await Installations.updateInstallationRepos(
    installationId,
    allRepos
  );

  console.log(allRepos);

  res.json({ response: { installation } }).status(200);
});

module.exports = router;
