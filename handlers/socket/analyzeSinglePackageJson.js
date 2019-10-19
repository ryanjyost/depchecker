module.exports = function(packageJson) {
  const analyze = fork("./services/analyze");
  analyze.send(packageJson);
  analyze.on("message", msg => {
    if (typeof msg !== "string") {
      this.socket.emit("final", msg);
    } else {
      this.socket.emit("update", msg);
    }
  });
};
