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
        <Link to="/signup" className="signup-button">
          Sign Up
        </Link>
        <Link to="/login" className="login-button">
          Log In
        </Link>
      </div>
    </header>
  );
};

export default Header;
