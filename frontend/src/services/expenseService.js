import axios from "axios";

const API = axios.create({ baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api" });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Expenses
export const createExpense = (data) => API.post("/expenses", data);
export const getExpenses = (params) => API.get("/expenses", { params });
export const updateExpense = (id, data) => API.put(`/expenses/${id}`, data);
export const deleteExpense = (id) => API.delete(`/expenses/${id}`);
export const getMonthlySummary = (params) => API.get("/expenses/summary/monthly", { params });
export const getCategorySummary = (params) => API.get("/expenses/summary/categories", { params });
