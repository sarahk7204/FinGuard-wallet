import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import Navbar from "../components/common/Navbar";
import Sidebar from "../components/common/Sidebar";

const AdminRoute = ({ children }) => {
  const { token, user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (user?.role !== "admin") {
    return <Navigate to="/dashboard" />;
  }

  return (
    <>
      <Navbar />
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">{children}</main>
      </div>
    </>
  );
};

export default AdminRoute;