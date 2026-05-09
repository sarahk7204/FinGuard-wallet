import { useState, useEffect } from "react";
import adminService from "../../services/adminService";
import useAuth from "../../hooks/useAuth";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import { formatDate } from "../../utils/formatCurrency";

const Users = () => {
  const { token } = useAuth();
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [search, setSearch]   = useState("");
  const [status, setStatus]   = useState("");
  const [actionId, setActionId] = useState(null); // id of user being blocked/unblocked

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminService.getUsers(token, { search, status });
      setUsers(res.data.users || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [search, status]);

  const showMsg = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 3500);
  };

  const handleBlock = async (id) => {
    setActionId(id);
    try {
      await adminService.blockUser(token, id);
      showMsg("User blocked successfully.", "success");
      load();
    } catch (err) {
      showMsg(err.response?.data?.message || "Failed to block user.", "error");
    } finally {
      setActionId(null);
    }
  };

  const handleUnblock = async (id) => {
    setActionId(id);
    try {
      await adminService.unblockUser(token, id);
      showMsg("User unblocked successfully.", "success");
      load();
    } catch (err) {
      showMsg(err.response?.data?.message || "Failed to unblock user.", "error");
    } finally {
      setActionId(null);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Users Management</h1>
      </div>

      {message.text && <div className={`message ${message.type}`}>{message.text}</div>}

      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="blocked">Blocked</option>
        </select>
      </div>

      {loading ? (
        <Loader />
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : users.length === 0 ? (
        <EmptyState icon="👥" message="No users found." />
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td style={{ color: "var(--text-secondary)" }}>{u.email}</td>
                  <td>
                    <span style={{ fontSize: 12, textTransform: "capitalize", color: u.role === "admin" ? "var(--accent)" : "var(--text-secondary)" }}>
                      {u.role}
                    </span>
                  </td>
                  <td><span className={`status-badge status-${u.status}`}>{u.status}</span></td>
                  <td style={{ color: "var(--text-secondary)", fontSize: 13 }}>{formatDate(u.createdAt)}</td>
                  <td>
                    {u.role !== "admin" && (
                      u.status === "active" ? (
                        <button
                          className="btn-danger"
                          style={{ padding: "5px 12px", fontSize: 12 }}
                          disabled={actionId === u._id}
                          onClick={() => handleBlock(u._id)}
                        >
                          {actionId === u._id ? "..." : "Block"}
                        </button>
                      ) : (
                        <button
                          className="btn-secondary"
                          style={{ padding: "5px 12px", fontSize: 12 }}
                          disabled={actionId === u._id}
                          onClick={() => handleUnblock(u._id)}
                        >
                          {actionId === u._id ? "..." : "Unblock"}
                        </button>
                      )
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Users;
