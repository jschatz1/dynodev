import axios from "axios";

export async function getProjects() {
  return axios.get("/projects.json");
}

export async function getUser() {
  return axios.get("/api/v1/users/user");
}

export async function getInvites() {
  return axios.get("/api/v1/users/user/invites");
}

export async function checkInvite(data) {
  return axios.post("/api/v1/invites/check", data);
}