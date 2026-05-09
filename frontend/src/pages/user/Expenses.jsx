import { useState, useEffect } from "react";
import { getExpenses, createExpense, updateExpense, deleteExpense } from "../../services/expenseService";

const CATEGORIES = ["Food","Transport","Shopping","Health","Education","Entertainment","Utilities","Rent","Travel","Other"];

const categoryColors = {
  Food: "#f59e0b", Transport: "#3b82f6", Shopping: "#ec4899",
  Health: "#10b981", Education: "#8b5cf6", Entertainment: "#f97316",
  Utilities: "#6b7280", Rent: "#ef4444", Travel: "#06b6d4", Other: "#84cc16",
};

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [filters, setFilters] = useState({ category: "", type: "" });
  const [form, setForm] = useState({
    title: "", amount: "", category: "Food", description: "", date: new Date().toISOString().split("T")[0], type: "expense",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.category) params.category = filters.category;
      if (filters.type) params.type = filters.type;
      const res = await getExpenses(params);
      setExpenses(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchExpenses(); }, [filters]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.title || !form.amount) return setError("Title and amount are required.");
    try {
      setSubmitting(true);
      if (editingExpense) {
        await updateExpense(editingExpense._id, form);
      } else {
        await createExpense(form);
      }
      setShowModal(false);
      setEditingExpense(null);
      resetForm();
      fetchExpenses();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this entry?")) return;
    try {
      await deleteExpense(id);
      fetchExpenses();
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  const handleEdit = (exp) => {
    setEditingExpense(exp);
    setForm({
      title: exp.title, amount: exp.amount, category: exp.category,
      description: exp.description || "", date: exp.date.split("T")[0], type: exp.type,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setForm({ title: "", amount: "", category: "Food", description: "", date: new Date().toISOString().split("T")[0], type: "expense" });
  };

  const totalExpense = expenses.filter(e => e.type === "expense").reduce((s, e) => s + e.amount, 0);
  const totalIncome = expenses.filter(e => e.type === "income").reduce((s, e) => s + e.amount, 0);

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", color: "#e2e8f0", fontFamily: "'Segoe UI', sans-serif", padding: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: "#f1f5f9", margin: 0 }}>💳 Expenses & Income</h1>
          <p style={{ color: "#94a3b8", margin: "4px 0 0" }}>Track every rupee you earn or spend</p>
        </div>
        <button
          onClick={() => { resetForm(); setEditingExpense(null); setShowModal(true); }}
          style={{ background: "#6366f1", color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontWeight: 600, cursor: "pointer", fontSize: 14 }}
        >
          + Add Entry
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Total Expenses", value: totalExpense, color: "#ef4444", icon: "📉" },
          { label: "Total Income", value: totalIncome, color: "#10b981", icon: "📈" },
          { label: "Net Balance", value: totalIncome - totalExpense, color: totalIncome - totalExpense >= 0 ? "#10b981" : "#ef4444", icon: "⚖️" },
        ].map((card) => (
          <div key={card.label} style={{ background: "#1e293b", borderRadius: 12, padding: 20, border: "1px solid #334155" }}>
            <div style={{ fontSize: 24 }}>{card.icon}</div>
            <div style={{ color: "#94a3b8", fontSize: 13, marginTop: 8 }}>{card.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: card.color, marginTop: 4 }}>
              PKR {Math.abs(card.value).toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <select
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          style={{ background: "#1e293b", color: "#e2e8f0", border: "1px solid #334155", borderRadius: 8, padding: "8px 12px", fontSize: 14 }}
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          style={{ background: "#1e293b", color: "#e2e8f0", border: "1px solid #334155", borderRadius: 8, padding: "8px 12px", fontSize: 14 }}
        >
          <option value="">All Types</option>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
      </div>

      {/* Expenses Table */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: "#64748b" }}>Loading...</div>
      ) : expenses.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "#64748b", background: "#1e293b", borderRadius: 12 }}>
          <div style={{ fontSize: 48 }}>📭</div>
          <p>No entries yet. Add your first expense or income!</p>
        </div>
      ) : (
        <div style={{ background: "#1e293b", borderRadius: 12, overflow: "hidden", border: "1px solid #334155" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#0f172a", borderBottom: "1px solid #334155" }}>
                {["Title", "Amount", "Category", "Type", "Date", "Actions"].map((h) => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", color: "#64748b", fontSize: 13, fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {expenses.map((exp, i) => (
                <tr key={exp._id} style={{ borderBottom: "1px solid #1e293b", background: i % 2 === 0 ? "#1e293b" : "#162032" }}>
                  <td style={{ padding: "12px 16px", fontWeight: 500 }}>{exp.title}</td>
                  <td style={{ padding: "12px 16px", color: exp.type === "income" ? "#10b981" : "#ef4444", fontWeight: 600 }}>
                    {exp.type === "income" ? "+" : "-"} PKR {exp.amount.toLocaleString()}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ background: categoryColors[exp.category] + "22", color: categoryColors[exp.category], borderRadius: 6, padding: "3px 10px", fontSize: 12, fontWeight: 600 }}>
                      {exp.category}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ background: exp.type === "income" ? "#10b98122" : "#ef444422", color: exp.type === "income" ? "#10b981" : "#ef4444", borderRadius: 6, padding: "3px 10px", fontSize: 12 }}>
                      {exp.type}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", color: "#94a3b8", fontSize: 13 }}>
                    {new Date(exp.date).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <button onClick={() => handleEdit(exp)} style={{ background: "#334155", color: "#e2e8f0", border: "none", borderRadius: 6, padding: "5px 12px", cursor: "pointer", fontSize: 13, marginRight: 8 }}>Edit</button>
                    <button onClick={() => handleDelete(exp._id)} style={{ background: "#ef444422", color: "#ef4444", border: "none", borderRadius: 6, padding: "5px 12px", cursor: "pointer", fontSize: 13 }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "#000000aa", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#1e293b", borderRadius: 16, padding: 32, width: "100%", maxWidth: 480, border: "1px solid #334155" }}>
            <h2 style={{ margin: "0 0 24px", fontSize: 20, fontWeight: 700 }}>{editingExpense ? "Edit Entry" : "Add New Entry"}</h2>

            {error && <div style={{ background: "#ef444422", color: "#ef4444", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 14 }}>{error}</div>}

            <form onSubmit={handleSubmit}>
              {[
                { label: "Title", key: "title", type: "text", placeholder: "e.g. Grocery Shopping" },
                { label: "Amount (PKR)", key: "amount", type: "number", placeholder: "e.g. 500" },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key} style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", color: "#94a3b8", fontSize: 13, marginBottom: 6 }}>{label}</label>
                  <input
                    type={type}
                    placeholder={placeholder}
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    style={{ width: "100%", background: "#0f172a", border: "1px solid #334155", borderRadius: 8, padding: "10px 14px", color: "#e2e8f0", fontSize: 14, boxSizing: "border-box" }}
                  />
                </div>
              ))}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                <div>
                  <label style={{ display: "block", color: "#94a3b8", fontSize: 13, marginBottom: 6 }}>Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    style={{ width: "100%", background: "#0f172a", border: "1px solid #334155", borderRadius: 8, padding: "10px 14px", color: "#e2e8f0", fontSize: 14 }}
                  >
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", color: "#94a3b8", fontSize: 13, marginBottom: 6 }}>Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    style={{ width: "100%", background: "#0f172a", border: "1px solid #334155", borderRadius: 8, padding: "10px 14px", color: "#e2e8f0", fontSize: 14 }}
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", color: "#94a3b8", fontSize: 13, marginBottom: 6 }}>Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  style={{ width: "100%", background: "#0f172a", border: "1px solid #334155", borderRadius: 8, padding: "10px 14px", color: "#e2e8f0", fontSize: 14, boxSizing: "border-box" }}
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: "block", color: "#94a3b8", fontSize: 13, marginBottom: 6 }}>Description (optional)</label>
                <textarea
                  placeholder="Additional notes..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  style={{ width: "100%", background: "#0f172a", border: "1px solid #334155", borderRadius: 8, padding: "10px 14px", color: "#e2e8f0", fontSize: 14, resize: "none", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setError(""); }}
                  style={{ flex: 1, background: "#334155", color: "#e2e8f0", border: "none", borderRadius: 10, padding: "12px", fontWeight: 600, cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ flex: 1, background: submitting ? "#4f46e5aa" : "#6366f1", color: "#fff", border: "none", borderRadius: 10, padding: "12px", fontWeight: 600, cursor: "pointer" }}
                >
                  {submitting ? "Saving..." : editingExpense ? "Update" : "Add Entry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
