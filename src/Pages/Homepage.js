import React from "react";
import "./Homepage.scss";
import CameraFeed from "../components/CameraFeed";

const Homepage = () => {
  return (
    <div className="homepage">
      <h1>Home Page</h1>
      <div className="homepage-content">
        <CameraFeed />
      </div>
    </div>
  );
};

export default Homepage;
