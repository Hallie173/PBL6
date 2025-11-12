import React, { useEffect, useState } from "react";
import "./EditProfile.scss";
import defaultAvatar from "../assets/images/avatar.png";

const EditProfile = () => {
  const [avatar, setAvatar] = useState(defaultAvatar);
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");

  useEffect(() => {
    const userInfo = localStorage.getItem("user");
    if (userInfo) {
      const user = JSON.parse(userInfo);
      setDisplayName(user.displayName || "");
      setRole(user.role || "");
      setAvatar(user.avatar || defaultAvatar);
      setEmail(user.email || "");
    }
  }, []);

  const handleSendCode = async () => {
    if (!newEmail) {
      alert("Please enter your new email address first!");
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
        alert("Verification code has been sent to your new email.");
      } else {
        alert(
          `Error: ${result.message || "Failed to send verification code."}`
        );
      }
    } catch (error) {
      console.error("Error sending code:", error);
      alert("Server error while sending verification code.");
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:8080/api/update-profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          displayName,
          role,
          newEmail,
          verificationCode,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert("Profile updated successfully!");
        localStorage.setItem("user", JSON.stringify(result.user));
        window.location.reload();
      } else {
        alert(`Error: ${result.message || "Failed to update profile."}`);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Server error while updating profile.");
    }
  };

  return (
    <div className="edit-profile">
      <h1 className="title">Edit Profile</h1>

      <div className="avatar-section">
        <img src={avatar} alt="User Avatar" className="avatar-image" />
        <label htmlFor="avatarUpload" className="edit-avatar-btn">
          Edit Avatar
        </label>
        <input
          id="avatarUpload"
          type="file"
          accept="image/*"
          style={{ display: "none" }}
        />
      </div>

      <div className="info-section">
        {/* Current Email (readonly) */}
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
            placeholder="Enter new email"
          />
        </div>

        <div className="info-item">
          <label>Verification Code</label>
          <input
            className="input-field"
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder="Enter verification code"
          />
          <button
            type="button"
            className="send-code-btn"
            onClick={handleSendCode}
          >
            Send Code
          </button>
        </div>
      </div>

      <div className="button-section">
        <button className="change-password-btn">Change Password</button>
        <button className="save-btn" onClick={handleSave}>
          Save
        </button>
      </div>
    </div>
  );
};

export default EditProfile;
