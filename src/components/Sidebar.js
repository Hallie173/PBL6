import React from "react";
import "./Sidebar.scss";
import avatar from "../assets/images/avatar.png";
import { Link } from "react-router-dom";
import Footer from "./Footer";

const Sidebar = () => {
  const username = "LDPH";

  return (
    <div className="sidebar">
      <div className="sidebar-profile">
        <img src={avatar} alt="User Avatar" className="avatar" />
        <h3 className="username">{username}</h3>
      </div>

      <ul className="sidebar-menu">
        <li>
          <Link to="/edit-profile">Chỉnh sửa thông tin cá nhân</Link>
        </li>
        <li>
          <Link to="/camera-history">Xem lịch sử camera</Link>
        </li>
        <li>
          <Link to="/alert-history">Xem lịch sử cảnh báo</Link>
        </li>
      </ul>
      <div className="sidebar-footer">
        <Footer />
      </div>
    </div>
  );
};

export default Sidebar;
