import api from "./api";

const adminService = {
  getDashboard: () =>
    api.get("/admin/dashboard"),

  getUsers: (token, params = {}) =>
    api.get("/admin/users", { params }),

  getUserById: (id) =>
    api.get(`/admin/users/${id}`),

  blockUser: (token, id) =>
    api.patch(`/admin/users/${id}/block`),

  unblockUser: (token, id) =>
    api.patch(`/admin/users/${id}/unblock`),

  getWallets: () =>
    api.get("/admin/wallets"),

  getAllTransactions: (token, params = {}) =>
    api.get("/admin/transactions", { params }),

  getFlaggedTransactions: () =>
    api.get("/admin/transactions/flagged"),

  getTransactionVolume: () =>
    api.get("/admin/reports/transaction-volume"),

  getSystemBalance: () =>
    api.get("/admin/reports/system-balance"),

  getCategories: () =>
    api.get("/categories"),

  createCategory: (token, data) =>
    api.post("/admin/categories", data),

  updateCategory: (id, data) =>
    api.put(`/admin/categories/${id}`, data),

  disableCategory: (token, id) =>
    api.patch(`/admin/categories/${id}/disable`),
};

export default adminService;
