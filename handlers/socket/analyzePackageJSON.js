const { fork } = require("child_process");

module.exports = function(socket, packageJson) {
  const analyze = fork("./services/analyze");
  analyze.send(packageJson);
  analyze.on("message", msg => {
    socket.emit(`basic/${msg.type}`, msg.data);
  });
};
