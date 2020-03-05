const Airtable = require("airtable");
const axios = require("axios");
const { forAxios } = require("../../lib");
const { fork } = require("child_process");

module.exports = async function(req, res) {
  const { username, email } = req.body;

  const userEndpoint = `https://api.github.com/users/${username}`;
  const { data: userData, error: userError } = await forAxios(
    axios.get(userEndpoint, {
      headers: {
        Accept: "application/vnd.github.v3.star+json"
      },
      auth: {
        username: process.env.GITHUB_CLIENT_ID,
        password: process.env.GITHUB_CLIENT_SECRET
      }
    })
  );

  if (userError) {
    return res
      .status(404)
      .json({ error: "No GitHub user with that username found." });
  }

  const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
    process.env.AIRTABLE_BASE_ID
  );

  const newRecord = {
    fields: {
      created: new Date().getTime(),
      username,
      email
    }
  };

  base("Table 1").create([newRecord], async function(err, records) {
    if (err) {
      console.error(err);
      return;
    }
    records.forEach(function(record) {
      const followTheStarsEmail = fork("./lib/stars");
      followTheStarsEmail.send(record);
    });
  });

  // get folks I follow as suggestions
  const githubFollowingUrl = `https://api.github.com/users/ryanjyost/following`;

  const followingResponse = await axios.get(githubFollowingUrl, {
    headers: {
      Accept: "application/vnd.github.v3.star+json"
    },
    auth: {
      username: process.env.GITHUB_CLIENT_ID,
      password: process.env.GITHUB_CLIENT_SECRET
    }
  });

  res.json({ success: true, users: followingResponse.data });
};
