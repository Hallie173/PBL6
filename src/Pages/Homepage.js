import React from "react";
import "./Homepage.scss";
import CameraFeed from "../components/CameraFeed";

const Homepage = () => {
  return (
    <div className="homepage">
      <h1 className="title">AI Real-time Detection (Fire, Smoke, Fall)</h1>
      <div className="homepage-content">
        <CameraFeed />
      </div>
    </div>
  );
};

export default Homepage;
