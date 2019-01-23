const express = require("express");
const router = express.Router();
const Bitbucket = require("../lib/bitbucket");
const to = require("../lib/helpers/to.js");
const request = require("request");
const axios = require("axios");

router.get("/", (req, res) => {
  res.send({ response: "I am alive" }).status(200);
});
router.post("/analyze", require("../lib/analyze"));
router.post("/read_package_json", async function(req, res) {
  if (req.files) {
    res.json(JSON.parse(req.files.file.data));
  }
});

module.exports = router;

//
// router.post("/bitbucket/get_user_repos", async function(req, res, next) {
//   const BitbucketApi = Bitbucket.createApi(req.body.access_token);
//   const user = req.body.user;
//
//   let err, repos;
//   // BitbucketApi.get("repositories/ryanjyost/deps/src/HEAD/package.json")
//
//   //console.log("user", user.data);
//   [err, repos] = await to(BitbucketApi.get(`repositories/${user.username}`));
//
//   if (err) {
//     // console.log(err.response.data);
//     console.log("ERROR");
//     res.status(500).json({ error: err.response.data.error });
//   }
//
//   res.json({ repos: repos.data.values });
// });
// router.post("/bitbucket/oauth", Bitbucket.getOAuthTokenAndUser);
// router.post("/bitbucket/onboard_new_user", Bitbucket.onboardNewUser);
//
// /* GET home page. */
// router.get("/", function(req, res, next) {
//   res.render("index", { title: "Express" });
// });
// router.get("/oauth", function(req, res) {
//   // When a user authorizes an app, a code query parameter is passed on the oAuth endpoint. If that code is not there, we respond with an error message
//   if (!req.query.code) {
//     res.status(500);
//     res.send({ Error: "Looks like we're not getting code." });
//     console.log("Looks like we're not getting code.");
//   } else {
//     // If it's there...
//
//     // We'll do a GET call to Slack's `oauth.access` endpoint, passing our app's client ID, client secret, and the code we just got as query parameters.
//     request(
//       {
//         url: "https://slack.com/api/oauth.access", //URL to hit
//         qs: {
//           code: req.query.code,
//           client_id: clientId,
//           client_secret: clientSecret
//         }, //Query string data
//         method: "GET" //Specify the method
//       },
//       function(error, response, body) {
//         if (error) {
//           console.log(error);
//         } else {
//           res.json(body);
//         }
//       }
//     );
//   }
// });
