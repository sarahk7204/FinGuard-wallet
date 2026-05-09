import { useState, useEffect } from "react";
import { getNotifications, markAsRead, markAllAsRead } from "../../services/notificationService";

const typeConfig = {
  "budget-warning": { icon: "⚠️", color: "#f59e0b", bg: "#f59e0b11" },
  "budget-exceeded": { icon: "🚨", color: "#ef4444", bg: "#ef444411" },
  "expense-added": { icon: "💳", color: "#6366f1", bg: "#6366f111" },
  general: { icon: "🔔", color: "#10b981", bg: "#10b98111" },
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await getNotifications();
      setNotifications(res.data.data);
      setUnreadCount(res.data.unreadCount);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const handleMarkRead = async (id) => {
    await markAsRead(id);
    fetchNotifications();
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    fetchNotifications();
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", color: "#e2e8f0", fontFamily: "'Segoe UI', sans-serif", padding: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: "#f1f5f9", margin: 0 }}>
            🔔 Notifications
            {unreadCount > 0 && (
              <span style={{ marginLeft: 12, background: "#ef4444", color: "#fff", borderRadius: 100, padding: "2px 10px", fontSize: 14, fontWeight: 700 }}>
                {unreadCount}
              </span>
            )}
          </h1>
          <p style={{ color: "#94a3b8", margin: "4px 0 0" }}>Budget alerts and system notifications</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            style={{ background: "#334155", color: "#e2e8f0", border: "none", borderRadius: 10, padding: "10px 18px", fontWeight: 600, cursor: "pointer", fontSize: 14 }}
          >
            Mark All Read
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: "#64748b" }}>Loading...</div>
      ) : notifications.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "#64748b", background: "#1e293b", borderRadius: 12 }}>
          <div style={{ fontSize: 48 }}>🔕</div>
          <p>No notifications yet. You're all caught up!</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {notifications.map((notif) => {
            const config = typeConfig[notif.type] || typeConfig.general;
            return (
              <div
                key={notif._id}
                style={{
                  background: notif.isRead ? "#1e293b" : config.bg,
                  border: `1px solid ${notif.isRead ? "#334155" : config.color + "44"}`,
                  borderRadius: 12,
                  padding: "16px 20px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 16,
                  opacity: notif.isRead ? 0.7 : 1,
                }}
              >
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 24, lineHeight: 1 }}>{config.icon}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15, color: notif.isRead ? "#94a3b8" : "#f1f5f9" }}>{notif.title}</div>
                    <div style={{ color: "#94a3b8", fontSize: 13, marginTop: 4 }}>{notif.message}</div>
                    <div style={{ color: "#475569", fontSize: 12, marginTop: 6 }}>
                      {new Date(notif.createdAt).toLocaleString("en-PK", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
                {!notif.isRead && (
                  <button
                    onClick={() => handleMarkRead(notif._id)}
                    style={{ background: "#334155", color: "#e2e8f0", border: "none", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 12, whiteSpace: "nowrap" }}
                  >
                    Mark Read
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
