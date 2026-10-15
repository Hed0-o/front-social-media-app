import { routeApi } from "./api";

export async function getUserData() {
  const response = await routeApi.get("/users/profile-data");
  return response.data;
}

