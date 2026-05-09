import { formatCurrency, formatShortDate } from "../../utils/formatCurrency";

const ExpenseRow = ({ expense, onEdit, onDelete }) => (
  <tr>
    <td>{expense.title}</td>
    <td>
      <span style={{ fontSize: 12, background: "rgba(99,102,241,0.15)", color: "#818cf8", padding: "2px 8px", borderRadius: "100px" }}>
        {expense.category}
      </span>
    </td>
    <td>
      <strong style={{ color: expense.type === "income" ? "var(--success)" : "var(--danger)" }}>
        {expense.type === "income" ? "+" : "−"} {formatCurrency(expense.amount)}
      </strong>
    </td>
    <td style={{ color: "var(--text-secondary)", fontSize: 13 }}>{expense.description || "—"}</td>
    <td style={{ color: "var(--text-secondary)", fontSize: 13 }}>{formatShortDate(expense.date)}</td>
    <td>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => onEdit(expense)} className="btn-secondary" style={{ padding: "4px 10px", fontSize: 12 }}>Edit</button>
        <button onClick={() => onDelete(expense._id)} className="btn-danger"     style={{ padding: "4px 10px", fontSize: 12 }}>Delete</button>
      </div>
    </td>
  </tr>
);

export default ExpenseRow;
