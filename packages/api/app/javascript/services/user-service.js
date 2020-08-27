import axios from "axios";

export async function getProjects() {
  return axios.get("/projects.json");
}

export async function getUser() {
  return axios.get("/api/v1/users/user");
}