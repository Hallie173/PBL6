import React from "react";
import { useState } from "react";
import "./SignupPage.scss";
import webLogo from "../assets/images/logo.png";

const SignUpPage = () => {
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("");
  const [verificationCode, setVerificationCode] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    const data = {
      email,
      displayName,
      password,
      role,
      verificationCode,
    };

    try {
      const response = await fetch("http://localhost:8080/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        alert("Signup successful!");
      } else {
        const errorMessage =
          result.message || "Signup failed! Please try again!";
        alert(`Error: ${errorMessage}`);
      }
    } catch (error) {
      console.error("Signup error:", error);
      alert("Server connection error. Please check the backend server.");
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-wrapper">
        <img
          src={webLogo}
          alt="Abnormal Situation Detection System"
          className="signup-logo"
        />
        <h2 className="signup-title">Create your account</h2>
      </div>

      <div className="signup-form-container">
        <form className="signup-form" onSubmit={handleSubmit}>
          {/* Email */}
          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Username */}
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label htmlFor="confirm-password">Confirm password</label>
            <input
              id="confirm-password"
              name="confirm-password"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {/* Role Selection */}
          <div className="form-group">
            <label htmlFor="role">Role</label>
            <select
              id="role"
              name="role"
              required
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="">Select your role</option>
              <option value="host">Host</option>
              <option value="member">Member</option>
            </select>
          </div>

          {/* Email Verifying Code */}
          <div className="form-group verify-group">
            <label htmlFor="verify-code">Email verifying code</label>
            <div className="verify-row">
              <input
                id="verify-code"
                name="verify-code"
                type="text"
                required
                placeholder="Enter code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
              />
              <button type="button" className="send-code-btn">
                Send Code
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button type="submit" className="submit-btn">
            Sign up
          </button>
        </form>

        <p className="login-link">
          Already have an account?{" "}
          <a href="/login" className="link">
            Sign in here
          </a>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;
