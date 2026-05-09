import { NavLink, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { logoutUser } from "../../services/authService";

const links = [
  { to: "/admin/dashboard",              icon: "🏠", label: "Dashboard" },
  { to: "/admin/users",                  icon: "👥", label: "Users" },
  { to: "/admin/wallets",               icon: "💼", label: "Wallets" },
  { to: "/admin/transactions",           icon: "📋", label: "Transactions" },
  { to: "/admin/transactions/flagged",   icon: "🚨", label: "Flagged" },
  { to: "/admin/categories",            icon: "🏷️",  label: "Categories" },
  { to: "/admin/reports",               icon: "📊", label: "Reports" },
];

const AdminSidebar = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try { await logoutUser(token); } catch {}
    logout();
    navigate("/login");
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">⚙️ Admin</div>
      <nav>
        {links.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/admin/dashboard"}
            className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}
          >
            <span>{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div style={{ padding: "20px", marginTop: "auto" }}>
        <button className="btn-logout" onClick={handleLogout} style={{ width: "100%" }}>
          Logout
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
