const { apiURL, post, get, put } = require("./utils");
module.exports = {
  show(uuid) {
    return get(`/projects/${uuid}/models`);
  },
  create(uuid, data) {
    return post(`/projects/${uuid}/models`, data);
  }
};
