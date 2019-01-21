const axios = require("axios");
const to = require("../helpers/to.js");
const qs = require("qs");

module.exports = {
  createApi: function() {
    return axios.create({
      baseURL:
        "https://hooks.slack.com/services/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",
      timeout: 3000,
      headers: {
        Accept: "application/json",
        "Content-type": "application/json"
      }
    });
  },

  sendMessage: async function(api) {
    console.log("start");
    let err, response;
    [err, response] = await to(
      api.post("", JSON.stringify({ text: "Hello skoosh" }))
    );

    if (err) {
      console.log("ERROR", err);
      return err;
    }

    console.log("HEY", response.data);

    return response;
  }
};
