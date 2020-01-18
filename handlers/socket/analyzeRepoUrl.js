const { fork } = require("child_process");
const { GitHub } = require("../../services");

async function analyzeRepoUrl(socket, url) {
  const packageJSON = await GitHub.getPackageJSONFromRepoUrl(url);
  socket.emit("basic/packageJSON", packageJSON);

  const analyze = fork("./services/analyze");
  analyze.send(packageJSON);
  analyze.on("message", msg => {
    socket.emit(`basic/${msg.type}`, msg.data);
  });
}

module.exports = analyzeRepoUrl;
