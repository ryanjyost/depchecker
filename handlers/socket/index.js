const analyzeSinglePackageJson = require("./analyzeSinglePackageJson");
const analyzeInstallation = require("./analyzeInstallation");

module.exports = function(socket) {
  this.socket = socket;
  // let the client know the socket id
  socket.emit("socketId", socket.id);

  // socket.on("analyzeSingle", analyzeSinglePackageJson);

  socket.on("analyze", installationId =>
    analyzeInstallation(socket, installationId)
  );

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
};
