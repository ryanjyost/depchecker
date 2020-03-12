const express = require("express");
const router = express.Router();
const to = require("../lib/helpers/to.js");
const axios = require("axios");
const analyze = require("../services/analyze");

const { Installations } = require("../models");
const { GitHub } = require("../services");
const Handlers = require("../handlers");
const { catchErrors } = require("../lib");

/* =================
 * Misc
 */
router.post("/auth", catchErrors(Handlers.routes.authorize));
router.post("/read_package_json", Handlers.routes.readPackageJSON);
router.post("/github/event", Handlers.routes.ghEvent);
router.post("/follow-the-stars", Handlers.routes.followTheStars);
router.delete("/follow-the-stars/:userId", Handlers.routes.unsubscribe);

/** Installations */
router.post("/installations/setup", Handlers.routes.setupNewInstallation);
router.post("/installations", Handlers.routes.addInstallation);
router.get(
  "/installations/:installationId/repos",
  Handlers.routes.getInstallationRepos
);
router.put(
  "/installations/:installationid/repos",
  Handlers.routes.updateInstallationRepos
);

router.get("/installations/:installationId", async (req, res) => {
  try {
    const installationId = req.params.installationId;
    const installation = await Installations.findInstallation(installationId);
    res.send({ response: { installation } }).status(200);
  } catch (e) {
    console.log("ERROR", e);
    res.json({});
  }
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
        `/repos/${installation.account.login}/${repo.name}/contents/package.json`
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

  res.json({ response: { installation } }).status(200);
});

router.get("/", (req, res) => {
  res.send({ response: "I am alive" }).status(200);
});

module.exports = router;
