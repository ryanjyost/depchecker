const axios = require("axios");
const moment = require("moment");

module.exports = async function() {
  const MAP = {};

  const thing = `jashkenas/underscore/pulls`;
  const githubUrl = `https://api.github.com/repos/${thing}`;

  const { data } = await axios.get(`${githubUrl}?sort=updated`, {
    headers: {
      Accept: "application/vnd.github.v3.star+json"
    },
    auth: {
      username: process.env.GITHUB_CLIENT_ID,
      password: process.env.GITHUB_CLIENT_SECRET
    }
  });

  const pulls = data.filter(p =>
    moment(p.updated_at).isAfter(moment().subtract(6, "months"))
  );

  for (let pull of pulls) {
    const url = `https://api.github.com/repos/${thing}/${pull.number}/files`;
    const { data: files } = await axios.get(url, {
      headers: {
        Accept: "application/vnd.github.v3.star+json"
      },
      auth: {
        username: process.env.GITHUB_CLIENT_ID,
        password: process.env.GITHUB_CLIENT_SECRET
      }
    });

    for (let file of files) {
      if (file.filename.includes("package")) {
        console.log(pull.html_url);
      }
    }
  }

  console.log("Done");
};
