import { useState, useEffect } from "react";
import { createBudget, getBudgets, updateBudget, deleteBudget } from "../../services/budgetService";

const CATEGORIES = ["Food","Transport","Shopping","Health","Education","Entertainment","Utilities","Rent","Travel","Other","Total"];

const statusConfig = {
  safe: { color: "#10b981", bg: "#10b98122", label: "Safe" },
  "near-limit": { color: "#f59e0b", bg: "#f59e0b22", label: "Near Limit" },
  exceeded: { color: "#ef4444", bg: "#ef444422", label: "Exceeded" },
};

export default function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const now = new Date();
  const [filterMonth, setFilterMonth] = useState(now.getMonth() + 1);
  const [filterYear, setFilterYear] = useState(now.getFullYear());
  const [form, setForm] = useState({ category: "Food", limit: "", month: now.getMonth() + 1, year: now.getFullYear() });
  const [error, setError] = useState("");

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const res = await getBudgets({ month: filterMonth, year: filterYear });
      setBudgets(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBudgets(); }, [filterMonth, filterYear]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editingBudget) {
        await updateBudget(editingBudget._id, { limit: Number(form.limit) });
      } else {
        await createBudget({ ...form, limit: Number(form.limit) });
      }
      setShowModal(false);
      setEditingBudget(null);
      fetchBudgets();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this budget?")) return;
    await deleteBudget(id);
    fetchBudgets();
  };

  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", color: "#e2e8f0", fontFamily: "'Segoe UI', sans-serif", padding: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: "#f1f5f9", margin: 0 }}>🎯 Budget Manager</h1>
          <p style={{ color: "#94a3b8", margin: "4px 0 0" }}>Set limits, track spending, avoid overspending</p>
        </div>
        <button
          onClick={() => { setEditingBudget(null); setForm({ category: "Food", limit: "", month: filterMonth, year: filterYear }); setError(""); setShowModal(true); }}
          style={{ background: "#6366f1", color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontWeight: 600, cursor: "pointer", fontSize: 14 }}
        >
          + Set Budget
        </button>
      </div>

      {/* Month/Year Filter */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        <select
          value={filterMonth}
          onChange={(e) => setFilterMonth(Number(e.target.value))}
          style={{ background: "#1e293b", color: "#e2e8f0", border: "1px solid #334155", borderRadius: 8, padding: "8px 12px", fontSize: 14 }}
        >
          {months.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
        </select>
        <select
          value={filterYear}
          onChange={(e) => setFilterYear(Number(e.target.value))}
          style={{ background: "#1e293b", color: "#e2e8f0", border: "1px solid #334155", borderRadius: 8, padding: "8px 12px", fontSize: 14 }}
        >
          {[2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: "#64748b" }}>Loading...</div>
      ) : budgets.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "#64748b", background: "#1e293b", borderRadius: 12 }}>
          <div style={{ fontSize: 48 }}>🎯</div>
          <p>No budgets set for this month. Start by adding one!</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
          {budgets.map((budget) => {
            const status = statusConfig[budget.status] || statusConfig.safe;
            const pct = Math.min(budget.usagePercent || 0, 100);
            return (
              <div key={budget._id} style={{ background: "#1e293b", borderRadius: 14, padding: 20, border: `1px solid ${status.color}33` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{budget.category}</h3>
                    <span style={{ fontSize: 12, background: status.bg, color: status.color, borderRadius: 6, padding: "2px 8px" }}>{status.label}</span>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => { setEditingBudget(budget); setForm({ ...budget, limit: budget.limit }); setShowModal(true); }}
                      style={{ background: "#334155", color: "#e2e8f0", border: "none", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 12 }}>Edit</button>
                    <button onClick={() => handleDelete(budget._id)}
                      style={{ background: "#ef444422", color: "#ef4444", border: "none", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 12 }}>Del</button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div style={{ background: "#0f172a", borderRadius: 100, height: 8, marginBottom: 12, overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: status.color, borderRadius: 100, transition: "width 0.3s" }} />
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <span style={{ color: "#94a3b8" }}>Spent: <strong style={{ color: status.color }}>PKR {budget.spent?.toLocaleString()}</strong></span>
                  <span style={{ color: "#94a3b8" }}>Limit: <strong style={{ color: "#e2e8f0" }}>PKR {budget.limit?.toLocaleString()}</strong></span>
                </div>
                <div style={{ marginTop: 8, fontSize: 13, color: "#64748b" }}>
                  Remaining: <strong style={{ color: budget.remaining > 0 ? "#10b981" : "#ef4444" }}>PKR {budget.remaining?.toLocaleString()}</strong>
                  <span style={{ float: "right", color: status.color }}>{pct}% used</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "#000000aa", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#1e293b", borderRadius: 16, padding: 32, width: "100%", maxWidth: 420, border: "1px solid #334155" }}>
            <h2 style={{ margin: "0 0 20px", fontSize: 20, fontWeight: 700 }}>{editingBudget ? "Update Budget Limit" : "Set New Budget"}</h2>
            {error && <div style={{ background: "#ef444422", color: "#ef4444", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 14 }}>{error}</div>}

            <form onSubmit={handleSubmit}>
              {!editingBudget && (
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", color: "#94a3b8", fontSize: 13, marginBottom: 6 }}>Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    style={{ width: "100%", background: "#0f172a", border: "1px solid #334155", borderRadius: 8, padding: "10px 14px", color: "#e2e8f0", fontSize: 14 }}
                  >
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              )}

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", color: "#94a3b8", fontSize: 13, marginBottom: 6 }}>Budget Limit (PKR)</label>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 10000"
                  value={form.limit}
                  onChange={(e) => setForm({ ...form, limit: e.target.value })}
                  required
                  style={{ width: "100%", background: "#0f172a", border: "1px solid #334155", borderRadius: 8, padding: "10px 14px", color: "#e2e8f0", fontSize: 14, boxSizing: "border-box" }}
                />
              </div>

              {!editingBudget && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                  <div>
                    <label style={{ display: "block", color: "#94a3b8", fontSize: 13, marginBottom: 6 }}>Month</label>
                    <select
                      value={form.month}
                      onChange={(e) => setForm({ ...form, month: Number(e.target.value) })}
                      style={{ width: "100%", background: "#0f172a", border: "1px solid #334155", borderRadius: 8, padding: "10px 12px", color: "#e2e8f0", fontSize: 14 }}
                    >
                      {months.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", color: "#94a3b8", fontSize: 13, marginBottom: 6 }}>Year</label>
                    <select
                      value={form.year}
                      onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}
                      style={{ width: "100%", background: "#0f172a", border: "1px solid #334155", borderRadius: 8, padding: "10px 12px", color: "#e2e8f0", fontSize: 14 }}
                    >
                      {[2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </div>
              )}

              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                <button type="button" onClick={() => setShowModal(false)}
                  style={{ flex: 1, background: "#334155", color: "#e2e8f0", border: "none", borderRadius: 10, padding: "12px", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                <button type="submit"
                  style={{ flex: 1, background: "#6366f1", color: "#fff", border: "none", borderRadius: 10, padding: "12px", fontWeight: 600, cursor: "pointer" }}>
                  {editingBudget ? "Update" : "Set Budget"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
