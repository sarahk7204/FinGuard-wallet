import { useState, useEffect } from "react";
import adminService from "../../services/adminService";
import useAuth from "../../hooks/useAuth";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import { formatCurrency, formatDate } from "../../utils/formatCurrency";

const AdminTransactions = () => {
  const { token } = useAuth();
  const [txns, setTxns]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [type, setType]       = useState("");
  const [status, setStatus]   = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await adminService.getAllTransactions(token, { type, status });
        setTxns(res.data.transactions || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load transactions.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token, type, status]);

  return (
    <div>
      <div className="page-header"><h1>All Transactions</h1></div>

      <div className="filter-bar">
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">All Types</option>
          <option value="deposit">Deposit</option>
          <option value="withdrawal">Withdrawal</option>
          <option value="transfer">Transfer</option>
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="successful">Successful</option>
          <option value="failed">Failed</option>
          <option value="flagged">Flagged</option>
        </select>
      </div>

      {loading ? <Loader /> : error ? (
        <div className="error-message">{error}</div>
      ) : txns.length === 0 ? (
        <EmptyState icon="📋" message="No transactions found." />
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>TXN ID</th>
                <th>Type</th>
                <th>Amount</th>
                <th>From</th>
                <th>To</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {txns.map((t) => (
                <tr key={t._id}>
                  <td style={{ fontFamily: "monospace", fontSize: 12 }}>{t.transactionId}</td>
                  <td><span className={`txn-type txn-${t.type}`}>{t.type}</span></td>
                  <td><strong>{formatCurrency(t.amount)}</strong></td>
                  <td style={{ color: "var(--text-secondary)", fontSize: 13 }}>{t.senderId?.email || "—"}</td>
                  <td style={{ color: "var(--text-secondary)", fontSize: 13 }}>{t.receiverId?.email || "—"}</td>
                  <td>
                    <span className={`status-badge status-${t.status}`}>{t.status}</span>
                    {t.suspiciousFlag && <span style={{ marginLeft: 4, fontSize: 12 }}>🚩</span>}
                  </td>
                  <td style={{ color: "var(--text-secondary)", fontSize: 13 }}>{formatDate(t.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminTransactions;
