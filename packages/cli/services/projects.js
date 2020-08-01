const common = require("./common");
const axios = require("axios");

let config = {};
axios.defaults.baseURL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://dyno.dev";

common.addAuthHeader();

module.exports.sayHello = async function sayHello() {
  return common.get("/api/v1/cli/hello");
};

module.exports.createOauth2Client = async function createOauth2Client(projectUUID, data) {
  return axios.post(`/api/v1/cli/${projectUUID}/create_oauth2_client`, data);
}

module.exports.doesSchemaExist = async function doesSchemaExist(projectUUID) {
  return axios.get(`/api/v1/cli/${projectUUID}/auth_initialized`);
}

module.exports.getProjectRoutes = async function getProjectRoutes(projectUUID) {
  return axios.get(`/api/v1/cli/${projectUUID}/routes`);
}

module.exports.getProjects = async function getProjects() {
  return common.get("/api/v1/projects");
};

module.exports.createProject = async function createProject(data) {
  return axios.post("/api/v1/projects", data);
};

module.exports.createSchema = async function createSchema(projectUUID, data) {
  return axios.post(`/api/v1/projects/${projectUUID}/schemas`, data);
};
