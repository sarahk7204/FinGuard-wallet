import axios from "axios";

const API = axios.create({ baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api" });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getUserDashboard = () => API.get("/reports/user-dashboard");
export const getIncomeExpenseReport = () => API.get("/reports/income-expense");
export const getBudgetUsageReport = (params) => API.get("/reports/budget-usage", { params });
