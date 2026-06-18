// api/axios.instance.js
import axios from "axios";

const normalizeBaseURL = (url) => String(url || "").replace(/\/+$/, "");

const defaultAdminBaseURL =
  import.meta.env.VITE_ADMIN_API_BASE_URL ||
  (import.meta.env.VITE_API_URL
    ? `${normalizeBaseURL(import.meta.env.VITE_API_URL)}/api/admin`
    : "https://mozno-server.vercel.app/api/admin");

const adminClient = axios.create({
  baseURL: defaultAdminBaseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add token
adminClient.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

adminClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");

      if (
        typeof window !== "undefined" &&
        window.location.pathname !== "/login"
      ) {
        window.location.assign("/login");
      }
    }

    return Promise.reject(error);
  },
);

export default adminClient;
