import React from "react";
import "./Header.scss";
import logo from "../assets/images/logo.png";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="header">
      <Link to="/" className="header-logo">
        <img src={logo} alt="Logo" className="header-logo-img" />
        <h1 className="header-title">Abnormal Situation Detection</h1>
      </Link>

      <div className="header-buttons">
        <button className="signup-button">Sign Up</button>
        <button className="login-button">Log In</button>
      </div>
    </header>
  );
};

export default Header;
