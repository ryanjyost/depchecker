const axios = require("axios");
const nodemailer = require("nodemailer");
const moment = require("moment");
const _ = require("lodash");
const Email = require("email-templates");
const mg = require("nodemailer-mailgun-transport");

async function getSingleEmailData(record, $userStarredRepoMap = {}) {
  try {
    const { email: userEmail, username } = record.fields;

    const githubFollowingUrl = `https://api.github.com/users/${username}/following`;

    const followingResponse = await axios.get(githubFollowingUrl, {
      headers: {
        Accept: "application/vnd.github.v3.star+json"
      },
      auth: {
        username: process.env.GITHUB_CLIENT_ID,
        password: process.env.GITHUB_CLIENT_SECRET
      }
    });

    console.log(
      `/***** Remaining ${followingResponse.headers["x-ratelimit-remaining"]} ******/`
    );

    let starredRepos = [];
    for (let user of followingResponse.data) {
      console.log("===========");
      console.log(user.login);
      if ($userStarredRepoMap[user.login]) {
        console.log("GOT INFO FROM MAP", user);
        starredRepos = [...starredRepos, ...$userStarredRepoMap[user.login]];
        continue;
      }

      const starUrl = `https://api.github.com/users/${user.login}/starred?per_page=50`;

      const { data: repos } = await axios.get(starUrl, {
        headers: {
          Accept: "application/vnd.github.v3.star+json"
        },
        auth: {
          username: process.env.GITHUB_CLIENT_ID,
          password: process.env.GITHUB_CLIENT_SECRET
        }
      });

      console.log("Count", repos.length);

      const finalList = repos
        .filter(item => {
          return moment(item.starred_at).isAfter(moment().subtract(7, "days"));
        })
        .map(item => {
          const { repo } = item;
          return {
            id: repo.id,
            name: repo.name,
            description: repo.description,
            full_name: repo.full_name,
            url: repo.html_url,
            stars: repo.stargazers_count,
            stars_formatted: repo.stargazers_count.toLocaleString("EN"),
            owner: {
              name: repo.owner.login,
              url: repo.owner.html_url
            }
          };
        });

      console.log("final", finalList.length);

      $userStarredRepoMap[user.login] = finalList;
      starredRepos = [...starredRepos, ...finalList];
    }

    const uniqueStarred = _.uniqBy(starredRepos, "name");

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "followthegithubstars@gmail.com",
        pass: "xh&U!zd%7fgA&3UN0YjU"
      }
    });

    // This is your API key that you retrieve from www.mailgun.com/cp (free up to 10K monthly emails)
    // const auth = {
    //   auth: {
    //     api_key: "key-905f09e7e9988d2eaa8e1a93ce5aabac\n",
    //     domain: "sandbox9ca4ec5305aa40ef95012ec85d2907d9.mailgun.org"
    //   }
    //   // proxy: 'http://user:pass@localhost:8080' // optional proxy, default is false
    // };
    //
    // const transporter = nodemailer.createTransport(mg(auth));

    const email = new Email({
      message: {
        from: "ryanjyost@gmail.com"
      },
      // uncomment below to send emails in development/test env:
      // send: true,
      transport: transporter
    });

    email
      .send({
        template: "stars",
        message: {
          // to: userEmail
          to: "rjyost@umich.edu"
        },
        locals: {
          user: username,
          repoCount: uniqueStarred.length,
          repos: uniqueStarred,
          unsubscribeLink: `${process.env.CLIENT_URL}/follow-the-stars?unsubscribe=${record.id}`
        }
      })
      .then(console.log)
      .catch(console.error);

    return $userStarredRepoMap;
  } catch (e) {
    console.log("ERROR", e);
  }
}

module.exports = getSingleEmailData;

process.on("message", async username => {
  console.log("Start analyzing...");
  await getSingleEmailData(username);
});
