import React from "react";
import "./LoginPage.scss"; // 👉 import file SCSS riêng

const LoginPage = () => {
  return (
    <div className="login-container">
      <div className="login-header">
        <img
          src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
          alt="Your Company"
          className="login-logo"
        />
        <h2 className="login-title">Sign in to your account</h2>
      </div>

      <div className="login-form-container">
        <form className="login-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email address
            </label>
            <input
              id="email"
              type="email"
              name="email"
              required
              autoComplete="email"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <div className="form-label-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <a href="#" className="forgot-password">
                Forgot password?
              </a>
            </div>
            <input
              id="password"
              type="password"
              name="password"
              required
              autoComplete="current-password"
              className="form-input"
            />
          </div>

          <button type="submit" className="login-button">
            Sign in
          </button>
        </form>

        <p className="signup-text">
          Not a member?{" "}
          <a href="#" className="signup-link">
            Start a 14 day free trial
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
