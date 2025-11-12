import React, { useEffect, useState } from "react";
import "./Sidebar.scss";
import defaultAvatar from "../assets/images/avatar.png";
import { Link } from "react-router-dom";
import Footer from "./Footer";

const Sidebar = () => {
  const [user, setUser] = useState(null);
  const [avatar, setAvatar] = useState(defaultAvatar); // ✅ Đặt ở trên, đảm bảo được khởi tạo đầu tiên

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userInfo = localStorage.getItem("user");

    if (token && userInfo) {
      try {
        const parsedUser = JSON.parse(userInfo);
        setUser(parsedUser);

        // Nếu có ảnh đại diện thì cập nhật, nếu không thì để mặc định
        if (parsedUser.avatar) {
          setAvatar(parsedUser.avatar);
        }
      } catch (err) {
        console.error("Error parsing user info:", err);
      }
    }
  }, []);

  return (
    <div className="sidebar">
      <div className="sidebar-profile">
        <img src={avatar} alt="User Avatar" className="avatar" />
        <h3 className="username">
          {user ? user.displayName || "Guest User" : "Guest User"}
        </h3>
      </div>

      {user ? (
        <>
          <ul className="sidebar-menu">
            <li>
              <Link to="/edit-profile">Chỉnh sửa thông tin cá nhân</Link>
            </li>
            <li>
              <Link to="/alert-history">Xem lịch sử cảnh báo</Link>
            </li>
          </ul>
        </>
      ) : (
        <p className="not-logged-in">Vui lòng đăng nhập để xem nội dung</p>
      )}

      <div className="sidebar-footer">
        <Footer />
      </div>
    </div>
  );
};

export default Sidebar;
