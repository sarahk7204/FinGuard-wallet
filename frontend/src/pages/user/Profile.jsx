import { useState, useEffect } from "react";
import useAuth from "../../hooks/useAuth";
import API from "../../services/authService";

const Profile = () => {
  const { user, token, login } = useAuth();
  const [formData, setFormData] = useState({ name: "", phone: "" });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({ name: user.name || "", phone: user.phone || "" });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });
    setLoading(true);
    try {
      const res = await API.put("/users/profile", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Update context with new user data
      login(res.data.data.user, token);
      setMessage({ text: "Profile updated successfully", type: "success" });
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || "Update failed",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });

    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      setMessage({ text: "New passwords do not match", type: "error" });
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setMessage({ text: "Password must be at least 6 characters", type: "error" });
      return;
    }

    setPwLoading(true);
    try {
      await API.put(
        "/auth/change-password",
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage({ text: "Password changed successfully", type: "success" });
      setPasswordData({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || "Password change failed",
        type: "error",
      });
    } finally {
      setPwLoading(false);
    }
  };

  if (!user) {
    return <div className="loading">Loading profile...</div>;
  }

  return (
    <div className="profile-page">
      <h1>My Profile</h1>

      {message.text && (
        <div className={`message ${message.type}`}>{message.text}</div>
      )}

      {/* Profile Info Card */}
      <div className="profile-card">
        <div className="profile-info">
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>
          <p>
            <strong>Status:</strong>{" "}
            <span className={`status-badge ${user.status}`}>{user.status}</span>
          </p>
          <p><strong>Joined:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Edit Profile Form */}
      <div className="form-card">
        <h2>Edit Profile</h2>
        <form onSubmit={handleProfileSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleProfileChange}
              placeholder="Enter your name"
            />
          </div>
          <div className="form-group">
            <label>Phone (optional)</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleProfileChange}
              placeholder="Enter phone number"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>

      {/* Change Password Form */}
      <div className="form-card">
        <h2>Change Password</h2>
        <form onSubmit={handlePasswordSubmit}>
          <div className="form-group">
            <label>Current Password</label>
            <input
              type="password"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              placeholder="Enter current password"
            />
          </div>
          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              placeholder="Min 6 characters"
            />
          </div>
          <div className="form-group">
            <label>Confirm New Password</label>
            <input
              type="password"
              name="confirmNewPassword"
              value={passwordData.confirmNewPassword}
              onChange={handlePasswordChange}
              placeholder="Repeat new password"
            />
          </div>
          <button type="submit" disabled={pwLoading} className="btn-primary">
            {pwLoading ? "Changing..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;