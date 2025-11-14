import React, { useEffect, useState } from "react";
import "./EditProfile.scss";
import defaultAvatar from "../assets/images/avatar.png";

const EditProfile = () => {
  const [avatar, setAvatar] = useState(defaultAvatar);
  const [fileAvatar, setFileAvatar] = useState(null);

  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const userInfo = localStorage.getItem("user");
    if (userInfo) {
      const user = JSON.parse(userInfo);

      setDisplayName(user.displayName || "");
      setRole(user.role || "");
      setEmail(user.email || "");

      if (user.avatar) {
        setAvatar(user.avatar);
      } else {
        setAvatar(defaultAvatar);
      }
    }
  }, []);

  const handleSendCode = async () => {
    if (!newEmail) {
      alert("Please enter your new email first.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:8080/api/send-verification-code",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: newEmail }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        alert("Verification code sent to your new email.");
      } else {
        alert(result.message || "Failed to send verification code.");
      }
    } catch (error) {
      console.error(error);
      alert("Server error while sending code.");
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      formData.append("displayName", displayName);
      formData.append("role", role);
      formData.append("newEmail", newEmail);
      formData.append("verificationCode", verificationCode);

      if (fileAvatar) formData.append("avatar", fileAvatar);

      const response = await fetch("http://localhost:8080/api/update-profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        alert("Profile updated successfully!");
        localStorage.setItem("user", JSON.stringify(result.user));
        window.location.reload();
      } else {
        alert(result.message || "Failed to update profile.");
      }
    } catch (error) {
      console.error(error);
      alert("Server error while updating profile.");
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileAvatar(file);
      setAvatar(URL.createObjectURL(file));
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("Please fill out all password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Password confirmation does not match.");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:8080/api/change-password",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        alert("Password changed successfully!");
        setShowPasswordModal(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        alert(result.message || "Failed to change password.");
      }
    } catch (error) {
      console.error(error);
      alert("Server error while changing password.");
    }
  };

  return (
    <div className="edit-profile">
      <h1 className="title">Edit Profile</h1>

      {/* Avatar section */}
      <div className="avatar-section">
        <img
          src={avatar || defaultAvatar}
          alt="User Avatar"
          className="avatar-image"
        />

        <label htmlFor="avatarUpload" className="edit-avatar-btn">
          Edit Avatar
        </label>

        <input
          id="avatarUpload"
          name="avatar"
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleAvatarChange}
        />
      </div>

      {/* Info fields */}
      <div className="info-section">
        <div className="info-item">
          <label>Current Email</label>
          <input
            className="input-field"
            type="email"
            value={email}
            readOnly
            disabled
          />
        </div>

        <div className="info-item">
          <label>Display Name</label>
          <input
            className="input-field"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>

        <div className="info-item">
          <label>Role</label>
          <select
            className="input-field"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="Host">Host</option>
            <option value="Member">Member</option>
          </select>
        </div>

        <div className="info-item">
          <label>New Email</label>
          <input
            className="input-field"
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
          />
        </div>

        <div className="info-item">
          <label>Verification Code</label>
          <input
            className="input-field"
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
          />

          <button className="send-code-btn" onClick={handleSendCode}>
            Send Code
          </button>
        </div>
      </div>

      <div className="button-section">
        <button
          className="change-password-btn"
          onClick={() => setShowPasswordModal(true)}
        >
          Change Password
        </button>

        <button className="save-btn" onClick={handleSave}>
          Save
        </button>
      </div>

      {showPasswordModal && (
        <div className="password-overlay">
          <div className="password-modal">
            <span
              className="close-icon"
              onClick={() => setShowPasswordModal(false)}
            >
              ×
            </span>

            <h2>Change Password</h2>

            <input
              type="password"
              className="input-field"
              placeholder="Current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />

            <input
              type="password"
              className="input-field"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <input
              type="password"
              className="input-field"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <div className="btn-row">
              <button
                className="cancel-btn"
                onClick={() => setShowPasswordModal(false)}
              >
                Cancel
              </button>

              <button className="save-btn" onClick={handleChangePassword}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditProfile;
