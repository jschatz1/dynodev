const axios = require("axios")
const {apiRoot} = require("../config");

function leftTrimSlash(url) {
  return url.charAt(0) === "/" ? url.substring(1) : url;
}

function apiURL(url, root = "", v = "v1") {
  return `${root}/api/${v}/${leftTrimSlash(url)}`;
}

module.exports.apiURL = apiURL

module.exports.staticURL = function staticURL(url, root = "") {
  return `${root}/${leftTrimSlash(url)}`;
}

module.exports.post = function post(url, data) {
  const config = {};
  config.baseURL = apiRoot;
  return axios.post(apiURL(url), data, config);
}

module.exports.put = function put(url, data) {
  const config = {};
  config.baseURL = apiRoot;
  return axios.put(apiURL(url), data, config);
}

module.exports.destroy = function destroy(url) {
  const config = {};
  config.baseURL = apiRoot;
  return axios.delete(apiURL(url), config);
}

module.exports.get = function get(url, data) {
  const config = {};
  config.baseURL = apiRoot;
  if (data) {
    config.params = data;
  }
  return axios.get(apiURL(url), config);
}

module.exports.getStatic = function getStatic(url) {
  const config = {};
  config.baseURL = apiRoot;
  return axios.get(staticURL(url), config);
}
