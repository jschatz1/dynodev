import axios from "axios";

export async function createProject(data) {
  return axios.post("/api/v1/projects", data);
};

export async function createOauth2Client(projectUUID, data) {
  return axios.post(`/api/v1/cli/${projectUUID}/create_oauth2_client`, data);
}

export async function getProject(projectUUID) {
  return axios.get(`/api/v1/projects/${projectUUID}.json`);
}

export async function getProjectSchema(projectUUID) {
  return axios.get(`/api/v1/projects/${projectUUID}/schemas.json`);
};

export async function getProjectRoutes(projectUUID, data) {
  return axios.get(`/api/v1/cli/${projectUUID}/routes`);
}

export async function createSchema(projectUUID, data) {
  return axios.post(`/api/v1/projects/${projectUUID}/schemas`, data);
};