import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { logoutUser } from "../../services/authService";

const Navbar = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutUser(token);
    } catch {
      // Even if API call fails, clear local state
    }
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <Link to="/dashboard" className="nav-logo">FinGuard</Link>

      <div className="nav-links">
        {user?.role === "admin" ? (
          <Link to="/admin/dashboard">Admin Panel</Link>
        ) : (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/profile">Profile</Link>
          </>
        )}
        <button onClick={handleLogout} className="btn-logout">
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;