const { apiURL, post, get, put } = require("./utils");
module.exports = {
  create(data) {
    return post("/projects", data);
  },
};
