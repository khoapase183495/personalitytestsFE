import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Card, Typography, Modal, message } from "antd";
import ProfileService from "../services/ProfileService";
import "./UserProfile.css";
message.success("Test notification!");
const { Title, Paragraph } = Typography;

function UserProfile() {
  const { user } = useAuth();
  const [editVisible, setEditVisible] = useState(false);
  const [resetVisible, setResetVisible] = useState(false);

  // Edit Profile State
  const [editForm, setEditForm] = useState({
    email: user?.email || "",
    username: user?.username || "",
    phone: user?.phone || "",
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState(null);

  // Reset Password State
  const [newPassword, setNewPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState(null);

  if (!user) {
    return (
      <div style={{ padding: 32, textAlign: "center" }}>
        <Title level={3}>User not found</Title>
        <Paragraph>Please log in to view your profile.</Paragraph>
      </div>
    );
  }

  // Edit Profile Handlers
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
    setEditError(null);
  };

  const handleEditSubmit = async (e) => {
  e.preventDefault();
  setEditLoading(true);
  setEditError(null);
  try {
    await ProfileService.updateAccount(user.id, editForm);
    message.success("Profile updated successfully!");
    setEditVisible(false);

    // Update localStorage with new user info
    const updatedUser = {
      ...user,
      email: editForm.email,
      username: editForm.username,
      phone: editForm.phone,
    };
    localStorage.setItem("user", JSON.stringify(updatedUser));

    setTimeout(() => {
      window.location.reload();
    }, 500);
  } catch (error) {
    setEditError(error.message || "Failed to update profile.");
  } finally {
    setEditLoading(false);
  }
};

const handleResetSubmit = async (e) => {
  e.preventDefault();
  setResetLoading(true);
  setResetError(null);
  if (!newPassword || newPassword.length < 6) {
    setResetError("Password must be at least 6 characters.");
    setResetLoading(false);
    return;
  }
  try {
    const result = await ProfileService.resetPassword(newPassword);
    // Show backend message if present, otherwise default
    if (typeof result === "string" && result === "Reset successfully") {
      message.success("Password reset successfully!");
    } else {
      message.success("Password reset successfully!");
    }
    setResetVisible(false);
    setNewPassword("");
  } catch (error) {
    setResetError(error.message || "Failed to reset password.");
  } finally {
    setResetLoading(false);
  }
};

  return (
    <div className="user-profile-container">
      <Card className="user-profile-card">
        <Title level={2}>User Profile</Title>
        <Paragraph>
          <strong>Username:</strong> {user.username || user.email}
        </Paragraph>
        <Paragraph>
          <strong>Email:</strong> {user.email}
        </Paragraph>
        <Paragraph>
          <strong>Phone:</strong> {user.phone || "N/A"}
        </Paragraph>
        <Paragraph>
          <strong>Role:</strong> {user.role?.name || user.role || "N/A"}
        </Paragraph>
        <div className="profile-actions">
          <button className="profile-action-btn" onClick={() => setEditVisible(true)}>
            Edit Profile
          </button>
          <button className="profile-action-btn" onClick={() => setResetVisible(true)}>
            Reset Password
          </button>
        </div>
      </Card>

      {/* Edit Profile Modal */}
      <Modal
        open={editVisible}
        onCancel={() => setEditVisible(false)}
        footer={null}
        centered
        destroyOnClose
        title={<span className="profile-modal-title">Edit Profile</span>}
        className="profile-modal"
      >
        <form className="profile-form" onSubmit={handleEditSubmit}>
          {editError && <div className="profile-error">{editError}</div>}
          <div className="profile-form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={editForm.email}
              onChange={handleEditChange}
              required
            />
          </div>
          <div className="profile-form-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={editForm.username}
              onChange={handleEditChange}
              required
            />
          </div>
          <div className="profile-form-group">
            <label>Phone</label>
            <input
              type="tel"
              name="phone"
              value={editForm.phone}
              onChange={handleEditChange}
              placeholder="Enter phone number"
            />
          </div>
          <button
            type="submit"
            className="profile-modal-btn"
            disabled={editLoading}
          >
            {editLoading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        open={resetVisible}
        onCancel={() => setResetVisible(false)}
        footer={null}
        centered
        destroyOnClose
        title={<span className="profile-modal-title">Reset Password</span>}
        className="profile-modal"
      >
        <form className="profile-form" onSubmit={handleResetSubmit}>
          {resetError && <div className="profile-error">{resetError}</div>}
          <div className="profile-form-group">
            <label>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => {
                setNewPassword(e.target.value);
                setResetError(null);
              }}
              placeholder="Enter new password"
              required
            />
          </div>
          <button
            type="submit"
            className="profile-modal-btn"
            disabled={resetLoading}
          >
            {resetLoading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </Modal>
    </div>
  );
}

export default UserProfile;