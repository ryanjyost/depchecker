const axios = require("axios");
const nodemailer = require("nodemailer");
const moment = require("moment");
const _ = require("lodash");
const Email = require("email-templates");

module.exports = async function() {
  console.log(process.env.NODE_ENV);
  try {
    const $userStarredRepoMap = {};

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

    console.log(
      `/***** Remaining ${followingResponse.headers["x-ratelimit-remaining"]} ******/`
    );

    let starredRepos = [];
    for (let user of [{ login: "JackHowa" }]) {
      console.log("===========");
      console.log(user.login);
      if ($userStarredRepoMap[user]) {
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

    console.log("STARRED", uniqueStarred.length);
    // console.log("MAP", $userStarredRepoMap);

    // const transporter = nodemailer.createTransport({
    //   service: "gmail",
    //   auth: {
    //     user: "followthegithubstars@gmail.com",
    //     pass: "xh&U!zd%7fgA&3UN0YjU"
    //   }
    // });
    //
    // var mailOptions = {
    //   from: "Follow the Stars",
    //   to: "rjyost@umich.edu",
    //   subject: "Hey, here are some starred repos to check out",
    //   template: "stars",
    //   locals: { user: "ryanjyost", repos: starredRepos }
    // };
    //
    // transporter.sendMail(mailOptions, function(error, info) {
    //   if (error) {
    //     console.log(error);
    //   } else {
    //     console.log("Email sent: " + info.response);
    //   }
    // });

    const email = new Email({
      message: {
        from: "Follow the Stars"
      },
      // uncomment below to send emails in development/test env:
      // send: true
      transport: {
        jsonTransport: true
      }
    });

    email
      .send({
        template: "stars",
        message: {
          to: "rjyost@umich.edu"
        },
        locals: {
          user: "ryanjyost",
          repoCount: starredRepos.length,
          repos: starredRepos
        }
      })
      .then(console.log)
      .catch(console.error);
  } catch (e) {
    console.log("ERROR", e);
  }
};
