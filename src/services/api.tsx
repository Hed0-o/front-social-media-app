import axios from "axios";

export const routeApi = axios.create({
  baseURL: "https://route-posts.routemisr.com",
});

routeApi.interceptors.request.use((config) => {
  const isAuthRequest =
    config.url === "/users/signup" || config.url === "/users/signin";

  const token = localStorage.getItem("token");

  if (token && !isAuthRequest) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (config.data instanceof FormData) {
    config.headers.delete("Content-Type");
  }

  return config;
});
