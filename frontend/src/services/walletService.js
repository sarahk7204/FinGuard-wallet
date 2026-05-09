import api from "./api";

export const fetchWallet = () => api.get("/wallet");

export const fetchWalletSummary = () => api.get("/wallet/summary");

export const depositFunds = (amount, description = "", category = "General") =>
  api.post("/wallet/deposit", { amount, description, category });

export const withdrawFunds = (amount, description = "", category = "General") =>
  api.post("/wallet/withdraw", { amount, description, category });

export const transferFunds = (receiverEmail, amount, description = "", category = "General") =>
  api.post("/wallet/transfer", { receiverEmail, amount, description, category });

// ── Transaction APIs ─────────────────────────────────────────────────────────

export const fetchTransactions = (params = {}) =>
  api.get("/transactions", { params });

export const fetchTransactionById = (id) => api.get(`/transactions/${id}`);

export const fetchTransactionReceipt = (id) => api.get(`/transactions/${id}/receipt`);

export const fetchMonthlySummary = () => api.get("/transactions/summary/monthly");
