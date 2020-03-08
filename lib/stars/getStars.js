const axios = require("axios");
const moment = require("moment");

module.exports = async function() {
  const devs = [
    "gaearon",
    "addyosmani",
    "paulirish",
    "thefoxis",
    "umaar",
    "elijahmanor",
    "jeresig",
    "dshaw",
    "kentcdodds",
    "johnpapa",
    "darkwing",
    "sachag",
    "wesbos",
    "getify",
    "markdalgleish",
    "chriscoyier",
    "mdo",
    "ry",
    "yyx990803",
    "Rich-Harris",
    "sdras",
    "emmabostian",
    "markerikson",
    "btholt",
    "benlesh"
  ];

  const MAP = {};

  for (let dev of devs) {
    const githubUrl = `https://api.github.com/users/${dev}/starred?per_page=50`;

    const { data } = await axios.get(githubUrl, {
      headers: {
        Accept: "application/vnd.github.v3.star+json"
      },
      auth: {
        username: process.env.GITHUB_CLIENT_ID,
        password: process.env.GITHUB_CLIENT_SECRET
      }
    });

    const final = data
      .filter(item => {
        const { repo } = item;
        return (
          !repo.fork &&
          // ["JavaScript", "TypeScript"].includes(repo.language) &&
          moment(item.starred_at).isAfter(moment().subtract(7, "days"))
        );
      })
      .sort((a, b) => {
        a = moment(a);
        b = moment(b);

        if (a.isAfter(b)) return 1;
        if (b.isAfter(a)) return -1;
        return 0;
      })
      .map(item => {
        if (!MAP[item.repo.name]) {
          MAP[item.repo.name] = item;
          MAP[item.repo.name].count = 1;
        } else {
          MAP[item.repo.name].count++;
        }

        return item.repo;
      });
  }

  // console.log("MAP", MAP);

  const moreThan1 = Object.keys(MAP).filter(key => MAP[key].count >= 1);

  for (let name of moreThan1) {
    const project = MAP[name];
    // console.log(project)
    const { repo } = project;
    console.log(`#### ${repo.name}<br/>`);
    console.log(`**Description:** ${repo.description} <br/>`);
    console.log(`**Repo URL:** [${repo.html_url}](${repo.html_url})<br/>`);
    console.log(
      `**Repo Owner:** [${repo.owner.login}](${repo.owner.html_url})<br/>`
    );
    console.log(
      `**GitHub Stars:** ${repo.stargazers_count.toLocaleString("EN")}<br/>`
    );
    console.log("___");

    // console.log(project);
  }

  // console.log("DATA", final);
  // console.log(MAP);
};
