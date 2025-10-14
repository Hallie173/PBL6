import React from "react";
import "./Header.scss";
import logo from "../assets/images/logo.png";

const Header = () => {
  return (
    <header className="header">

      <div className="header-logo">
        <img
          src={logo}
          alt="Logo"
          className="header-logo-img"
        />
        <h1 className="header-title">Fire Detection</h1>
      </div>

      <div className="header-buttons">
        <button className="signup-button">Đăng ký</button>
        <button className="login-button">Đăng nhập</button>
      </div>
    </header>
  );
};

export default Header;
