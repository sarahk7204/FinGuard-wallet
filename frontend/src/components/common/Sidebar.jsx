import { NavLink, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { logoutUser } from "../../services/authService";

const userLinks = [
  { to: "/dashboard",     icon: "🏠", label: "Dashboard" },
  { to: "/wallet",        icon: "💰", label: "Wallet" },
  { to: "/transactions",  icon: "📋", label: "Transactions" },
  { to: "/expenses",      icon: "💳", label: "Expenses" },
  { to: "/budgets",       icon: "📊", label: "Budgets" },
  { to: "/reports",       icon: "📈", label: "Reports" },
  { to: "/notifications", icon: "🔔", label: "Notifications" },
  { to: "/profile",       icon: "👤", label: "Profile" },
];

const Sidebar = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try { await logoutUser(token); } catch {}
    logout();
    navigate("/login");
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">FinGuard</div>

      <nav>
        {userLinks.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}
          >
            <span>{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: "20px", marginTop: "auto" }}>
        <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 12 }}>
          {user?.name}
        </div>
        <button className="btn-logout" onClick={handleLogout} style={{ width: "100%" }}>
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
