import React from "react";
import "./Homepage.scss";

const Homepage = () => {
  return (
    <div className="homepage">
      <h1>Home Page</h1>
      <div className="homepage-content">
        <div className="video-container">
          <img src="http://127.0.0.1:5000/raw_video_feed" alt="Video Feed" />
        </div>
      </div>
    </div>
  );
};

export default Homepage;
