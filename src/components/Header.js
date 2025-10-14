import React from "react";
import "./Header.scss";

const Header = () => {
  return (
    <header className="header">

      <div className="header__logo">
        <img
          //src="/logo.png"
          alt="Logo"
          className="header__logo-img"
        />
        <h1 className="header__title">Fire Detection</h1>
      </div>

      <div className="header__buttons">
        <button className="header__btn header__btn--outline">Đăng ký</button>
        <button className="header__btn header__btn--primary">Đăng nhập</button>
      </div>
    </header>
  );
};

export default Header;
