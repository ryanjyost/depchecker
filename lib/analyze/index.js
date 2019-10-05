const to = require("../helpers/to.js");
const analyze = require("./analyze");

process.on("message", async packageJSON => {
  console.log("MESSAGE", packageJSON);
  let err, data;
  [err, data] = await to(analyze(packageJSON, process));
  process.send(data);
});
