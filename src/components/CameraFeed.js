// src/components/CameraFeed.js
import React, { useRef, useEffect, useState } from "react";
import axios from "axios";
// 1. IMPORT FILE SCSS VÀO COMPONENT
import "../styles/CameraFeed.scss";

const API_URL = "http://localhost:5000/api/detect_frame";
const INTERVAL_MS = 500; // Tần suất gửi ảnh (2 frame/giây)

function CameraFeed() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [detections, setDetections] = useState([]);

  // Kích thước cố định (dùng để tính toán Bounding Box và kích thước hiển thị)
  const videoWidth = 640;
  const videoHeight = 480;

  // 1. Truy cập và hiển thị Camera
  useEffect(() => {
    // ... (Giữ nguyên logic này)
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => {
        console.error("Lỗi khi truy cập camera:", err);
      });

    // Dọn dẹp stream khi component unmount
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  // 2. Định kỳ lấy frame và gọi API
  useEffect(() => {
    // ... (Giữ nguyên logic này)
    const interval = setInterval(async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (!video || !canvas) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = canvas.toDataURL("image/jpeg");

      try {
        const response = await axios.post(API_URL, { image: imageData });
        setDetections(response.data.detections);
      } catch (error) {
        console.error("Lỗi gọi API:", error);
      }
    }, INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  // 3. Hàm vẽ Bounding Box lên video
  const drawBoxes = () => {
    if (!detections.length) return null;

    return detections.map((detection, index) => {
      const [x1, y1, x2, y2] = detection.box;

      // Tính toán tỷ lệ
      const scaleX =
        videoWidth / (canvasRef.current ? canvasRef.current.width : videoWidth);
      const scaleY =
        videoHeight /
        (canvasRef.current ? canvasRef.current.height : videoHeight);

      return (
        <div
          key={index}
          // 3. THÊM CLASS NAME cho Bounding Box
          className="bounding-box"
          style={{
            // Chỉ giữ lại các style liên quan đến vị trí và kích thước động
            left: `${x1 * scaleX}px`,
            top: `${y1 * scaleY}px`,
            width: `${(x2 - x1) * scaleX}px`,
            height: `${(y2 - y1) * scaleY}px`,
            // Thuộc tính hiển thị văn bản không đổi vẫn được giữ ở đây hoặc chuyển sang SCSS
          }}
        >
          {`${detection.label} (${detection.confidence})`}
        </div>
      );
    });
  };

  return (
    // 2. THAY THẾ style inline của container bằng className
    <div className="camera-feed-container">
      {/* Element hiển thị Video từ Camera */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        width={videoWidth}
        height={videoHeight}
        className="video-stream" // THÊM CLASS NAME cho video
      />

      {/* Canvas ẩn để xử lý frame ảnh */}
      <canvas
        ref={canvasRef}
        className="hidden-canvas" // THÊM CLASS NAME cho canvas
      />

      {/* Vị trí để hiển thị Bounding Box */}
      {drawBoxes()}
    </div>
  );
}

export default CameraFeed;
