const { fork } = require("child_process");
const { Installations } = require("../../models");
const { GitHub } = require("../../services");

const analyzeSinglePackageJson = require("./analyzeSinglePackageJson");
const analyzeInstallation = require("./analyzeInstallation");

module.exports = function(socket) {
  this.socket = socket;
  // let the client know the socket id
  socket.emit("socketId", socket.id);

  socket.on("analyzeSingle", analyzeSinglePackageJson.bind(this));

  socket.on("analyze", analyzeInstallation.bind(this));

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
};
