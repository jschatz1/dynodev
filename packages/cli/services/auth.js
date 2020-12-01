const axios = require("axios");

let config = {};
axios.defaults.baseURL = "http://localhost:3000";
module.exports.baseURL = axios.defaults.baseURL;

module.exports.postAuth = async function postAuth() {
  return axios.post("/api/v1/cli/auth");
};

module.exports.getAuth = async function getAuth(url, token) {
  return axios.get(url, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
}
