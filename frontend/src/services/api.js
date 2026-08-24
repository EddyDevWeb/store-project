import axios from "axios";
import toast from "react-hot-toast";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

let sessionExpiredNotified = false;

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url ?? "";

    const isAuthRequest =
      url.includes("/users/login") ||
      url.includes("/users/register") ||
      url.includes("/users/google");

    if (status === 401 && !isAuthRequest && !sessionExpiredNotified) {
      sessionExpiredNotified = true;

      localStorage.removeItem("token");
      localStorage.removeItem("userInfo");

      toast.error("Tu sesión ha expirado. Inicia sesión de nuevo.");

      setTimeout(() => {
        window.location.replace("/login");
        sessionExpiredNotified = false;
      }, 900);
    }

    return Promise.reject(error);
  }
);

export default api;
