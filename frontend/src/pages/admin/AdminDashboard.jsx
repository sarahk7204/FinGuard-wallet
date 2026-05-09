import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import adminService from "../../services/adminService";
import useAuth from "../../hooks/useAuth";
import Loader from "../../components/common/Loader";
import "../../styles/dashboard.css";

const AdminDashboard = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await adminService.getDashboard(token);
        setStats(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  if (loading) return <Loader text="Loading admin dashboard..." />;
  if (error)   return <div className="error-message">{error}</div>;

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1>Admin Dashboard</h1>
        <span style={{ color: "var(--text-secondary)", fontSize: 14 }}>System Overview</span>
      </div>

      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="label">Total Users</div>
          <div className="value accent">{stats?.totalUsers ?? 0}</div>
        </div>
        <div className="admin-stat-card">
          <div className="label">Active Users</div>
          <div className="value success">{stats?.activeUsers ?? 0}</div>
        </div>
        <div className="admin-stat-card">
          <div className="label">Blocked Users</div>
          <div className="value danger">{stats?.blockedUsers ?? 0}</div>
        </div>
        <div className="admin-stat-card">
          <div className="label">Total Transactions</div>
          <div className="value">{stats?.totalTransactions ?? 0}</div>
        </div>
        <div className="admin-stat-card">
          <div className="label">Flagged Transactions</div>
          <div className="value warning">{stats?.flaggedTransactions ?? 0}</div>
        </div>
        <div className="admin-stat-card">
          <div className="label">System Balance</div>
          <div className="value success" style={{ fontSize: 18 }}>
            PKR {stats?.systemBalance?.toLocaleString() ?? 0}
          </div>
        </div>
      </div>

      {/* Quick admin nav */}
      <div className="quick-links" style={{ marginBottom: 0 }}>
        <Link to="/admin/users"                className="quick-btn">👥 Users</Link>
        <Link to="/admin/wallets"              className="quick-btn">💼 Wallets</Link>
        <Link to="/admin/transactions"         className="quick-btn">📋 Transactions</Link>
        <Link to="/admin/transactions/flagged" className="quick-btn">🚨 Flagged</Link>
        <Link to="/admin/categories"           className="quick-btn">🏷️ Categories</Link>
        <Link to="/admin/reports"              className="quick-btn">📊 Reports</Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
