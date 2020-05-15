const axios = require("axios");

let config = {};
axios.defaults.baseURL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://havedecidedyet.com";

module.exports.getProjects = async function getProjects() {
  return axios.get("/api/v1/projects");
};

module.exports.createProject = async function createProject(data) {
  return axios.post("/api/v1/projects", data);
};
