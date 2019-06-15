module.exports = function to(promise) {
  return promise
    .then(data => {
      return [null, data];
    })
    .catch(err => {
      console.log("ERROR in AXIOS", err);
      return [err];
    });
};
