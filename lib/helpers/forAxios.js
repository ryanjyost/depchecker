const qs = require("qs");

module.exports = function(promise) {
  const normalized = {
    error: "Something went wrong",
    data: null,
    ok: false,
    original: null,
    status: null
  };

  return promise
    .then(response => {
      normalized.original = response;
      normalized.data = normalizeDataToJson(
        response.data,
        response.headers["content-type"]
      );
      normalized.status = response.status;

      const { status } = response;
      if (isOk(status)) {
        normalized.ok = true;
        normalized.error = null;
        return normalized;
      }

      normalized.error = normalizeDataToJson(
        response.data,
        response.headers["content-type"]
      );
      return normalized;
    })
    .catch(err => {
      normalized.error = err;
      const { response } = err;
      normalized.data = normalizeDataToJson(
        response.data,
        response.headers["content-type"]
      );
      normalized.status = response.status;
      return normalized;
    });
};

function isOk(status) {
  return status >= 200 && status < 300;
}

function normalizeDataToJson(data, contentType) {
  if (contentType.includes("application/x-www-form-urlencoded")) {
    return qs.parse(data);
  }
  return data;
}
