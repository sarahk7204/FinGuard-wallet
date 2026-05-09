import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";

// Public
import Landing from "../pages/Landing";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import NotFound from "../pages/NotFound";

// User pages
import Dashboard from "../pages/user/Dashboard";
import Wallet from "../pages/user/Wallet";
import Transactions from "../pages/user/Transactions";
import TransactionReceipt from "../pages/user/TransactionReceipt";
import Expenses from "../pages/user/Expenses";
import Budgets from "../pages/user/Budgets";
import Reports from "../pages/user/Reports";
import Notifications from "../pages/user/Notifications";
import Profile from "../pages/user/Profile";

// Admin pages
import AdminDashboard from "../pages/admin/AdminDashboard";
import Users from "../pages/admin/Users";
import Wallets from "../pages/admin/Wallets";
import AdminTransactions from "../pages/admin/Transactions";
import FlaggedTransactions from "../pages/admin/FlaggedTransactions";
import Categories from "../pages/admin/Categories";
import AdminReports from "../pages/admin/Reports";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* User Protected */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
      <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
      <Route path="/transactions/:id/receipt" element={<ProtectedRoute><TransactionReceipt /></ProtectedRoute>} />
      <Route path="/expenses" element={<ProtectedRoute><Expenses /></ProtectedRoute>} />
      <Route path="/budgets" element={<ProtectedRoute><Budgets /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

      {/* Admin Protected */}
      <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/admin/users" element={<AdminRoute><Users /></AdminRoute>} />
      <Route path="/admin/wallets" element={<AdminRoute><Wallets /></AdminRoute>} />
      <Route path="/admin/transactions" element={<AdminRoute><AdminTransactions /></AdminRoute>} />
      <Route path="/admin/transactions/flagged" element={<AdminRoute><FlaggedTransactions /></AdminRoute>} />
      <Route path="/admin/categories" element={<AdminRoute><Categories /></AdminRoute>} />
      <Route path="/admin/reports" element={<AdminRoute><AdminReports /></AdminRoute>} />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
