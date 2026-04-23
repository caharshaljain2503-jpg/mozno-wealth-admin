// services/auth.js
import adminClient from "../axios.instance";

// ✅ Ab sahi URL use karo
export const login = async (payload) => {
  const res = await adminClient.post("/sign-in", payload);
  return res.data;
};

export const verifyOtp = async (payload) => {
  const res = await adminClient.post("/verify-otp", payload);
  return res.data;
};

export const sendOtp = async (payload) => {
  const res = await adminClient.post("/send-otp", payload);
  return res.data;
};

// Admin CRUD APIs
export const adminApi = {
  getAll: async (params = {}) => {
    const response = await adminClient.get("/users", { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await adminClient.get(`/users/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await adminClient.post("/users", data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await adminClient.put(`/users/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await adminClient.delete(`/users/${id}`);
    return response.data;
  },

  toggleStatus: async (id) => {
    const response = await adminClient.patch(`/users/${id}/status`);
    return response.data;
  },

  resetPassword: async (id) => {
    const response = await adminClient.post(`/users/${id}/reset-password`);
    return response.data;
  },

  getStats: async () => {
    const response = await adminClient.get("/stats");
    return response.data;
  },

  getProfile: async () => {
    const response = await adminClient.get("/profile");
    return response.data;
  },

  changePassword: async (data) => {
    const response = await adminClient.put("/change-password", data);
    return response.data;
  },
};
