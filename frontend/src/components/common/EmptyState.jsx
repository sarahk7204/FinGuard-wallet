const EmptyState = ({ icon = "📭", message = "Nothing here yet.", action = null }) => (
  <div className="empty-state">
    <div className="empty-icon">{icon}</div>
    <p>{message}</p>
    {action && <div style={{ marginTop: 16 }}>{action}</div>}
  </div>
);

export default EmptyState;
