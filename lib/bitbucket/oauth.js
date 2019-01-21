const to = require("../helpers/to.js");
const axios = require("axios");
const formurlencoded = require("form-urlencoded").default;
const User = require("../../models/user.js");

module.exports = async function(req, res) {
  let err, response;

  const data = {
    grant_type: "authorization_code",
    client_id: process.env.BITBUCKET_CLIENT_ID,
    client_secret: process.env.BITBUCKET_CLIENT_SECRET,
    code: req.body.code
    // redirect_uri: "localhost:3000"
  };

  let digested = Buffer.from(
    `${process.env.BITBUCKET_CLIENT_ID}:${process.env.BITBUCKET_CLIENT_SECRET}`
  ).toString("base64");

  [err, response] = await to(
    axios({
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${digested}`
      },
      url: "https://bitbucket.org/site/oauth2/access_token",
      data: formurlencoded(data)
    })
  );

  console.log("REFRSH", response.data.refresh_token);

  if (err) {
    res.status(500).json({ error: err.response.data });
  }

  const BitbucketApi = require("./index.js").createApi(
    response.data.access_token
  );
  let user;
  // BitbucketApi.get("repositories/ryanjyost/deps/src/HEAD/package.json")
  [err, user] = await to(BitbucketApi.get("user"));

  if (err) {
    res.status(500).json({ error: err.response });
  }

  let existingUser;
  [err, existingUser] = await to(
    User.findOneAndUpdate(
      {
        username: user.data.username
      },
      { $set: { refresh_token: response.data.refresh_token } },
      { new: true }
    )
  );

  let newUser;
  if (!existingUser) {
    [err, newUser] = await to(
      User.create({
        username: user.data.username,
        bitbucket: user.data,
        refresh_token: response.data.refresh_token
      })
    );
  }

  if (err) {
    res.status(500).json({ error: err });
  } else {
    res.json({ oauth: response.data, user: newUser || existingUser });
  }
};
