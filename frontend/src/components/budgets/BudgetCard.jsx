import { formatCurrency } from "../../utils/formatCurrency";

const BudgetCard = ({ budget, onDelete }) => {
  const pct = Math.min(budget.usagePercent ?? 0, 100);
  const barClass =
    budget.status === "exceeded"   ? "progress-exceeded" :
    budget.status === "near-limit" ? "progress-near"     : "progress-safe";

  const statusColor =
    budget.status === "exceeded"   ? "var(--danger)"  :
    budget.status === "near-limit" ? "var(--warning)" : "var(--success)";

  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 700 }}>{budget.category}</h3>
          <span style={{ fontSize: 12, color: statusColor, fontWeight: 600 }}>
            {budget.status?.toUpperCase()}
          </span>
        </div>
        <button
          onClick={() => onDelete(budget._id)}
          style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontSize: 16 }}
        >✕</button>
      </div>

      <div className="progress-bar-wrap">
        <div className={`progress-bar ${barClass}`} style={{ width: `${pct}%` }} />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 13 }}>
        <span style={{ color: "var(--text-secondary)" }}>
          Spent: <strong style={{ color: "var(--text-primary)" }}>{formatCurrency(budget.spent)}</strong>
        </span>
        <span style={{ color: "var(--text-secondary)" }}>
          Limit: <strong style={{ color: "var(--text-primary)" }}>{formatCurrency(budget.limit)}</strong>
        </span>
      </div>

      <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 6 }}>
        {pct}% used · {formatCurrency(budget.remaining)} remaining
      </div>
    </div>
  );
};

export default BudgetCard;
