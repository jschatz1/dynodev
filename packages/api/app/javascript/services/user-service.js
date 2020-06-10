import axios from "axios";

export async function getUser() {
  return axios.get("/api/v1/users/user");
}