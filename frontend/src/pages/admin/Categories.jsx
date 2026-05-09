import { useState, useEffect } from "react";
import adminService from "../../services/adminService";
import useAuth from "../../hooks/useAuth";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import Modal from "../../components/common/Modal";

const Categories = () => {
  const { token } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [message, setMessage]       = useState({ text: "", type: "" });
  const [showModal, setShowModal]   = useState(false);
  const [form, setForm]             = useState({ name: "", type: "both" });
  const [saving, setSaving]         = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminService.getCategories(token);
      setCategories(res.data.categories || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [token]);

  const showMsg = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 3500);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return showMsg("Name is required.", "error");
    setSaving(true);
    try {
      await adminService.createCategory(token, form);
      showMsg("Category created.", "success");
      setShowModal(false);
      setForm({ name: "", type: "both" });
      load();
    } catch (err) {
      showMsg(err.response?.data?.message || "Failed to create category.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDisable = async (id) => {
    try {
      await adminService.disableCategory(token, id);
      showMsg("Category disabled.", "success");
      load();
    } catch (err) {
      showMsg(err.response?.data?.message || "Failed to disable.", "error");
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Category Management</h1>
        <button className="btn-primary" style={{ width: "auto" }} onClick={() => setShowModal(true)}>
          + Add Category
        </button>
      </div>

      {message.text && <div className={`message ${message.type}`}>{message.text}</div>}

      {loading ? <Loader /> : error ? (
        <div className="error-message">{error}</div>
      ) : categories.length === 0 ? (
        <EmptyState icon="🏷️" message="No categories yet." />
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr><th>Name</th><th>Type</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c._id}>
                  <td>{c.name}</td>
                  <td style={{ color: "var(--text-secondary)", fontSize: 13 }}>{c.type}</td>
                  <td>
                    <span className={`status-badge ${c.isActive ? "status-active" : "status-blocked"}`}>
                      {c.isActive ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td>
                    {c.isActive && (
                      <button
                        className="btn-danger"
                        style={{ padding: "4px 10px", fontSize: 12 }}
                        onClick={() => handleDisable(c._id)}
                      >
                        Disable
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <Modal title="Add Category" onClose={() => setShowModal(false)} loading={saving}>
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label>Category Name</label>
              <input
                type="text"
                placeholder="e.g. Travel, Food"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="both">Both (Transaction & Expense)</option>
                <option value="expense">Expense only</option>
                <option value="transaction">Transaction only</option>
              </select>
            </div>
            <div className="modal-buttons">
              <button type="submit" className="btn-primary" disabled={saving}>{saving ? "Saving..." : "Create"}</button>
              <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Categories;
