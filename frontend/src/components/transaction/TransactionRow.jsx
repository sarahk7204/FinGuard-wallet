import { Link } from "react-router-dom";
import { formatCurrency, formatDate } from "../../utils/formatCurrency";

const TransactionRow = ({ txn, userId }) => {
  const isIncoming =
    txn.type === "deposit" ||
    (txn.type === "transfer" && txn.receiverId?._id === userId);

  return (
    <tr>
      <td style={{ fontFamily: "monospace", fontSize: 12 }}>{txn.transactionId}</td>
      <td><span className={`txn-type txn-${txn.type}`}>{txn.type}</span></td>
      <td>
        <span className={`txn-amount ${isIncoming ? "positive" : "negative"}`}>
          {isIncoming ? "+" : "−"} {formatCurrency(txn.amount)}
        </span>
      </td>
      <td style={{ fontSize: 13, color: "var(--text-secondary)" }}>
        {txn.description || "—"}
      </td>
      <td>
        <span className={`status-badge status-${txn.status}`}>{txn.status}</span>
        {txn.suspiciousFlag && <span title="Flagged" style={{ marginLeft: 4 }}>🚩</span>}
      </td>
      <td style={{ fontSize: 13, color: "var(--text-secondary)" }}>{formatDate(txn.createdAt)}</td>
      <td>
        <Link to={`/transactions/${txn._id}/receipt`} style={{ fontSize: 13 }}>
          Receipt →
        </Link>
      </td>
    </tr>
  );
};

export default TransactionRow;
