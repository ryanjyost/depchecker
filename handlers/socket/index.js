const analyzePackageJSON = require("./analyzePackageJSON");
const analyzeInstallation = require("./analyzeInstallation");
const analyzeRepoUrl = require("./analyzeRepoUrl");

module.exports = function(socket) {
  this.socket = socket;
  // let the client know the socket id
  socket.emit("socketId", socket.id);

  socket.on("analyzeRepoUrl", url => analyzeRepoUrl(socket, url));

  socket.on("analyzePackageJSON", packageJSON =>
    analyzePackageJSON(socket, packageJSON)
  );

  socket.on("analyzeInstallation", installationId =>
    analyzeInstallation(socket, installationId)
  );

  socket.on("disconnect", () => {});
};
