const exec = require("child_process").exec;
const shell = require("shelljs");
var cmd = require("node-cmd");

module.exports = function execute(command) {
  return new Promise((resolve, reject) => {
    const child = shell.exec(command, { async: true });
    child.stdout.on("data", function(data) {
      resolve(data);
    });

    child.stderr.on("data", function(data) {
      reject(data);
    });
  });
};

// module.exports = function execute(command, callback) {
//   return new Promise((resolve, reject) => {
//     exec(command, function(error, stdout, stderr) {
//       if (error) {
//         console.log("ERROR!", error);
//         reject(error);
//       } else if (stderr) {
//         console.log("ERROR!", stderr);
//         reject(stderr);
//       } else {
//         console.log("SUCCESS");
//         resolve(stdout);
//       }
//     });
//   });
// };

function asyncChildProcess(child) {
  return new Promise((resolve, reject) => {
    child.stdout.on("data", function(data) {
      resolve(data);
    });

    child.stderr.on("data", function(data) {
      reject(data);
    });
  });
}
