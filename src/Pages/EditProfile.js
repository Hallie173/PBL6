import React, { useState } from "react";
import "./EditProfile.scss";
import defaultAvatar from "../assets/images/avatar.png"; // Đổi đường dẫn theo dự án của bạn

const EditProfile = () => {
  const [avatar, setAvatar] = useState(defaultAvatar);
  const [username, setUsername] = useState("User123");
  const [role, setRole] = useState("Administrator");
  const [cameraName, setCameraName] = useState("Camera 1");

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(URL.createObjectURL(file));
    }
  };

  const handleSave = () => {
    alert("Profile saved successfully!");
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
          className="input-field"
          id="avatarUpload"
          type="file"
          accept="image/*"
          onChange={handleAvatarChange}
          style={{ display: "none" }}
        />
      </div>

      <div className="info-section">
        <div className="info-item">
          <label>Username</label>
          <input
            className="input-field"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="info-item">
          <label>Role</label>
          <select
            className="input-field"
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option className="option-field" value="Host">
              Host
            </option>
            <option className="option-field" value="Member">
              Member
            </option>
          </select>
        </div>
        <div className="info-item">
          <label>Camera name:</label>
          <input
            className="input-field"
            type="text"
            value={cameraName}
            onChange={(e) => setCameraName(e.target.value)}
          />
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
