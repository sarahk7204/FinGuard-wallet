/**
 * SimpleBarChart — pure CSS bar chart, no extra library needed.
 * Props:
 *   data: [{ label: string, value: number, color?: string }]
 *   title: string
 */
const SimpleBarChart = ({ data = [], title = "" }) => {
  if (!data.length) return <div className="empty-state"><p>No chart data available.</p></div>;

  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="card" style={{ marginBottom: 24 }}>
      {title && <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>{title}</h3>}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 160, padding: "0 8px" }}>
        {data.map((d, i) => {
          const pct = (d.value / max) * 100;
          return (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 600 }}>
                {d.value?.toLocaleString()}
              </span>
              <div
                style={{
                  width: "100%",
                  height: `${pct}%`,
                  minHeight: 4,
                  background: d.color || "var(--accent)",
                  borderRadius: "4px 4px 0 0",
                  transition: "height 0.4s ease",
                }}
              />
              <span style={{ fontSize: 11, color: "var(--text-secondary)", textAlign: "center", lineHeight: 1.3 }}>
                {d.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SimpleBarChart;
