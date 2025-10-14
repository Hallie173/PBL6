const Homepage = () => {
  return (
    <div className="Homepage">
        <h1>Home Page</h1>
        <div className="Homepage__content">
            <p>Welcome to the homepage!</p>
            <div className="video-container">
                <img src="http://127.0.0.1:5000/video_feed" alt="Fire detection stream" />
                </div>
        </div>
    </div>
    );
};

export default Homepage;