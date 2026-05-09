import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { fetchWalletSummary } from "../../services/walletService";
import { fetchTransactions } from "../../services/walletService";

const Dashboard = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [recentTxns, setRecentTxns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [sumRes, txnRes] = await Promise.all([
          fetchWalletSummary(),
          fetchTransactions({ limit: 5 }),
        ]);
        setSummary(sumRes.data.data.summary);
        setRecentTxns(txnRes.data.data.transactions || []);
      } catch (err) {
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="dashboard-page">
      <h1>Welcome back, {user?.name} 👋</h1>

      {/* Wallet Summary Cards */}
      {summary && (
        <div className="summary-cards">
          <div className="card">
            <p className="card-label">Wallet Balance</p>
            <h2 className="card-value">PKR {summary.balance?.toLocaleString()}</h2>
            {summary.isLowBalance && (
              <span className="badge-warning">⚠️ Low Balance</span>
            )}
          </div>
          <div className="card">
            <p className="card-label">Total Deposited</p>
            <h2 className="card-value">PKR {summary.totalDeposits?.toLocaleString()}</h2>
          </div>
          <div className="card">
            <p className="card-label">Total Withdrawn</p>
            <h2 className="card-value">PKR {summary.totalWithdrawals?.toLocaleString()}</h2>
          </div>
          <div className="card">
            <p className="card-label">Transfers Out</p>
            <h2 className="card-value">PKR {summary.totalTransfersOut?.toLocaleString()}</h2>
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="quick-links">
        <Link to="/wallet" className="quick-btn">💰 Wallet</Link>
        <Link to="/transactions" className="quick-btn">📋 Transactions</Link>
        <Link to="/expenses" className="quick-btn">💳 Expenses</Link>
        <Link to="/budgets" className="quick-btn">📊 Budgets</Link>
      </div>

      {/* Recent Transactions */}
      <div className="section">
        <div className="section-header">
          <h2>Recent Transactions</h2>
          <Link to="/transactions">View all →</Link>
        </div>

        {recentTxns.length === 0 ? (
          <div className="empty-state">No transactions yet.</div>
        ) : (
          <div className="txn-list">
            {recentTxns.map((txn) => (
              <div key={txn._id} className="txn-row">
                <div>
                  <span className={`txn-type txn-${txn.type}`}>{txn.type}</span>
                  <span className="txn-desc">{txn.description || "-"}</span>
                </div>
                <div>
                  <span className={`txn-amount ${txn.type === "deposit" ? "positive" : "negative"}`}>
                    {txn.type === "deposit" ? "+" : "-"} PKR {txn.amount?.toLocaleString()}
                  </span>
                  <span className={`txn-status status-${txn.status}`}>{txn.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
