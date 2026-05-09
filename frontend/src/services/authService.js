import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const API = axios.create({
  baseURL: API_URL,
});

export const registerUser = async (userData) => {
  const response = await API.post("/auth/register", userData);
  return response.data;
};

export const loginUser = async (userData) => {
  const response = await API.post("/auth/login", userData);
  return response.data;
};

export const logoutUser = async (token) => {
  const response = await API.post(
    "/auth/logout",
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const getCurrentUser = async (token) => {
  const response = await API.get("/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const changePassword = async (passwordData, token) => {
  const response = await API.put("/auth/change-password", passwordData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// ADDED: was missing — used by Profile.jsx
export const updateProfile = async (profileData, token) => {
  const response = await API.put("/users/profile", profileData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export default API;