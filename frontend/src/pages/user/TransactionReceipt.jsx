import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchTransactionReceipt } from "../../services/walletService";

const TransactionReceipt = () => {
  const { id } = useParams();
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchTransactionReceipt(id);
        setReceipt(res.data.data.receipt);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load receipt.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <div className="loading">Loading receipt...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!receipt) return <div className="error-message">Receipt not found.</div>;

  return (
    <div className="receipt-page">
      <div className="receipt-card">
        <div className="receipt-header">
          <h1>Transaction Receipt</h1>
          <span className={`status-badge status-${receipt.status}`}>{receipt.status}</span>
        </div>

        <div className="receipt-body">
          <div className="receipt-row">
            <span>Transaction ID</span>
            <strong>{receipt.transactionId}</strong>
          </div>
          <div className="receipt-row">
            <span>Type</span>
            <strong className={`txn-type txn-${receipt.type}`}>{receipt.type}</strong>
          </div>
          <div className="receipt-row">
            <span>Amount</span>
            <strong>PKR {receipt.amount?.toLocaleString()}</strong>
          </div>
          <div className="receipt-row">
            <span>Category</span>
            <strong>{receipt.category || "General"}</strong>
          </div>
          <div className="receipt-row">
            <span>Description</span>
            <strong>{receipt.description || "-"}</strong>
          </div>
          {receipt.sender && (
            <div className="receipt-row">
              <span>From</span>
              <strong>{receipt.sender.name} ({receipt.sender.email})</strong>
            </div>
          )}
          {receipt.receiver && (
            <div className="receipt-row">
              <span>To</span>
              <strong>{receipt.receiver.name} ({receipt.receiver.email})</strong>
            </div>
          )}
          <div className="receipt-row">
            <span>Date</span>
            <strong>{new Date(receipt.date).toLocaleString()}</strong>
          </div>
          {receipt.suspiciousFlag && (
            <div className="receipt-row suspicious">
              <span>⚠️ Flagged</span>
              <strong>{receipt.suspiciousReasons?.join(", ")}</strong>
            </div>
          )}
        </div>

        <div className="receipt-footer">
          <Link to="/transactions" className="btn-secondary">← Back to Transactions</Link>
          <button className="btn-primary" onClick={() => window.print()}>Print Receipt</button>
        </div>
      </div>
    </div>
  );
};

export default TransactionReceipt;
