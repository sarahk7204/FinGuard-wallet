import { useState, useEffect } from "react";
import adminService from "../../services/adminService";
import useAuth from "../../hooks/useAuth";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import { formatCurrency, formatDate } from "../../utils/formatCurrency";

const FlaggedTransactions = () => {
  const { token } = useAuth();
  const [txns, setTxns]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await adminService.getFlaggedTransactions(token);
        setTxns(res.data.transactions || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load flagged transactions.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  if (loading) return <Loader />;
  if (error)   return <div className="error-message">{error}</div>;

  return (
    <div>
      <div className="page-header">
        <h1>🚨 Flagged Transactions</h1>
        <span style={{ color: "var(--danger)", fontSize: 14, fontWeight: 600 }}>
          {txns.length} flagged
        </span>
      </div>

      {txns.length === 0 ? (
        <EmptyState icon="✅" message="No flagged transactions. System looks clean!" />
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
                <th>Suspicious Reasons</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {txns.map((t) => (
                <tr key={t._id}>
                  <td style={{ fontFamily: "monospace", fontSize: 12 }}>{t.transactionId}</td>
                  <td><span className={`txn-type txn-${t.type}`}>{t.type}</span></td>
                  <td><strong style={{ color: "var(--danger)" }}>{formatCurrency(t.amount)}</strong></td>
                  <td style={{ fontSize: 13 }}>{t.senderId?.email || "—"}</td>
                  <td style={{ fontSize: 13 }}>{t.receiverId?.email || "—"}</td>
                  <td style={{ fontSize: 12, color: "var(--warning)" }}>
                    {t.suspiciousReasons?.join(" | ") || "—"}
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

export default FlaggedTransactions;
