import { useState, useEffect } from "react";
import { getUserDashboard, getIncomeExpenseReport, getBudgetUsageReport } from "../../services/reportService";

const statusColors = {
  safe: "#10b981",
  "near-limit": "#f59e0b",
  exceeded: "#ef4444",
};

const BAR_MAX_HEIGHT = 120;

function BarChart({ data }) {
  if (!data || data.length === 0) return <div style={{ color: "#64748b", textAlign: "center", padding: 20 }}>No data</div>;
  const maxVal = Math.max(...data.map((d) => Math.max(d.expense, d.income)), 1);

  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: BAR_MAX_HEIGHT + 40, paddingBottom: 30, position: "relative" }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: BAR_MAX_HEIGHT }}>
            {/* Income bar */}
            <div
              title={`Income: PKR ${d.income.toLocaleString()}`}
              style={{
                width: 14,
                height: `${(d.income / maxVal) * BAR_MAX_HEIGHT}px`,
                background: "#10b981",
                borderRadius: "4px 4px 0 0",
                minHeight: 2,
              }}
            />
            {/* Expense bar */}
            <div
              title={`Expense: PKR ${d.expense.toLocaleString()}`}
              style={{
                width: 14,
                height: `${(d.expense / maxVal) * BAR_MAX_HEIGHT}px`,
                background: "#ef4444",
                borderRadius: "4px 4px 0 0",
                minHeight: 2,
              }}
            />
          </div>
          <div style={{ fontSize: 10, color: "#64748b", marginTop: 4, textAlign: "center" }}>{d.label?.split(" ")[0]}</div>
        </div>
      ))}
      {/* Legend */}
      <div style={{ position: "absolute", top: 0, right: 0, display: "flex", gap: 12, fontSize: 11 }}>
        <span style={{ color: "#10b981" }}>● Income</span>
        <span style={{ color: "#ef4444" }}>● Expense</span>
      </div>
    </div>
  );
}

function DonutChart({ data }) {
  if (!data || data.length === 0) return <div style={{ color: "#64748b", textAlign: "center", padding: 20 }}>No data</div>;
  const total = data.reduce((s, d) => s + d.total, 0);
  const colors = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#ec4899", "#8b5cf6", "#06b6d4", "#84cc16", "#f97316"];

  let cumulativePercent = 0;
  const slices = data.map((d, i) => {
    const pct = (d.total / total) * 100;
    const startAngle = (cumulativePercent / 100) * 360;
    cumulativePercent += pct;
    const endAngle = (cumulativePercent / 100) * 360;

    const toRad = (deg) => (deg - 90) * (Math.PI / 180);
    const x1 = 50 + 40 * Math.cos(toRad(startAngle));
    const y1 = 50 + 40 * Math.sin(toRad(startAngle));
    const x2 = 50 + 40 * Math.cos(toRad(endAngle));
    const y2 = 50 + 40 * Math.sin(toRad(endAngle));
    const largeArc = pct > 50 ? 1 : 0;

    return { d: `M50,50 L${x1},${y1} A40,40 0 ${largeArc},1 ${x2},${y2} Z`, color: colors[i % colors.length], label: d._id, total: d.total, pct };
  });

  return (
    <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
      <svg viewBox="0 0 100 100" style={{ width: 140, height: 140, flexShrink: 0 }}>
        {slices.map((s, i) => <path key={i} d={s.d} fill={s.color} />)}
        <circle cx="50" cy="50" r="22" fill="#1e293b" />
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {slices.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: s.color, flexShrink: 0 }} />
            <span style={{ color: "#94a3b8" }}>{s.label}</span>
            <span style={{ color: "#f1f5f9", marginLeft: "auto", fontWeight: 600 }}>{s.pct.toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Reports() {
  const [dashboard, setDashboard] = useState(null);
  const [incomeExpense, setIncomeExpense] = useState([]);
  const [budgetUsage, setBudgetUsage] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [dashRes, incRes, budRes] = await Promise.all([
          getUserDashboard(),
          getIncomeExpenseReport(),
          getBudgetUsageReport(),
        ]);
        setDashboard(dashRes.data.data);
        setIncomeExpense(incRes.data.data);
        setBudgetUsage(budRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", fontFamily: "'Segoe UI', sans-serif" }}>
      Loading reports...
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", color: "#e2e8f0", fontFamily: "'Segoe UI', sans-serif", padding: "24px" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "#f1f5f9", margin: 0 }}>📊 Reports & Analytics</h1>
        <p style={{ color: "#94a3b8", margin: "4px 0 0" }}>Full financial overview and insights</p>
      </div>

      {/* Summary Cards */}
      {dashboard && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
          {[
            { label: "This Month's Expenses", value: dashboard.totalExpense, color: "#ef4444", icon: "📉" },
            { label: "This Month's Income", value: dashboard.totalIncome, color: "#10b981", icon: "📈" },
            { label: "Net Balance", value: dashboard.netBalance, color: dashboard.netBalance >= 0 ? "#10b981" : "#ef4444", icon: "💰" },
          ].map((c) => (
            <div key={c.label} style={{ background: "#1e293b", borderRadius: 12, padding: 20, border: "1px solid #334155" }}>
              <div style={{ fontSize: 24 }}>{c.icon}</div>
              <div style={{ color: "#94a3b8", fontSize: 13, marginTop: 8 }}>{c.label}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: c.color, marginTop: 4 }}>PKR {Math.abs(c.value).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        {/* Income vs Expense Chart */}
        <div style={{ background: "#1e293b", borderRadius: 14, padding: 20, border: "1px solid #334155" }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700 }}>Income vs Expense (Last 6 Months)</h3>
          <BarChart data={incomeExpense} />
        </div>

        {/* Category Breakdown Donut */}
        <div style={{ background: "#1e293b", borderRadius: 14, padding: 20, border: "1px solid #334155" }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700 }}>Expense by Category</h3>
          <DonutChart data={dashboard?.categoryBreakdown} />
        </div>
      </div>

      {/* Budget Usage */}
      <div style={{ background: "#1e293b", borderRadius: 14, padding: 20, border: "1px solid #334155" }}>
        <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700 }}>Budget Usage This Month</h3>
        {budgetUsage.length === 0 ? (
          <div style={{ color: "#64748b", textAlign: "center", padding: 20 }}>No budgets set for this month.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {budgetUsage.map((b) => (
              <div key={b.category}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                  <span style={{ fontWeight: 600 }}>{b.category}</span>
                  <span style={{ color: statusColors[b.status] }}>
                    PKR {b.spent.toLocaleString()} / PKR {b.limit.toLocaleString()} ({b.usagePercent}%)
                  </span>
                </div>
                <div style={{ background: "#0f172a", borderRadius: 100, height: 8, overflow: "hidden" }}>
                  <div style={{ width: `${Math.min(b.usagePercent, 100)}%`, height: "100%", background: statusColors[b.status], borderRadius: 100 }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
