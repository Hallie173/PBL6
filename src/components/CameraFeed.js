import React, { useRef, useEffect, useState } from "react";
import axios from "axios";
import "./CameraFeed.scss";

const API_URL = "http://localhost:8080/api/detect_frame";
const INTERVAL_MS = 300; // Tăng tốc độ lấy frame (từ 500ms xuống 300ms ~ 3.3 FPS)

function CameraFeed() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [detections, setDetections] = useState([]);
  const [videoDimensions, setVideoDimensions] = useState({
    width: 0,
    height: 0,
  });

  const DEFAULT_WIDTH = 640;
  const DEFAULT_HEIGHT = 480;

  // 1. Truy cập và hiển thị Camera
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: { width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT } })
      .then((stream) => {
        console.log("✅ Camera Stream acquired successfully!");

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // Lắng nghe sự kiện metadata loaded để lấy kích thước video thực
          videoRef.current.onloadedmetadata = () => {
            const width = videoRef.current.videoWidth;
            const height = videoRef.current.videoHeight;
            setVideoDimensions({ width, height });
          };
        }
      })
      .catch((err) => {
        console.error("Lỗi khi truy cập camera:", err);
        alert("Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập.");
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
    if (videoDimensions.width === 0) return; // Chờ có kích thước thực của video

    const interval = setInterval(async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (!video || !canvas || video.readyState !== 4) return; // Đảm bảo video đã sẵn sàng

      // Thiết lập kích thước canvas bằng kích thước video thực
      canvas.width = videoDimensions.width;
      canvas.height = videoDimensions.height;

      const ctx = canvas.getContext("2d");
      // Vẽ frame video lên canvas
      ctx.drawImage(video, 0, 0, videoDimensions.width, videoDimensions.height);

      // Chuyển canvas thành Base64 (image/jpeg)
      const imageData = canvas.toDataURL("image/jpeg");

      try {
        // Gọi API Node.js BE
        const response = await axios.post(API_URL, { image: imageData });
        // Kết quả trả về là { frame_width, frame_height, detections: [...] }
        setDetections(response.data.detections);
      } catch (error) {
        // Bắt lỗi kết nối Node.js hoặc lỗi từ Flask qua Node.js
        console.error(
          "Lỗi gọi API:",
          error.response ? error.response.data : error.message
        );
        // Có thể thêm logic thông báo cho người dùng nếu server AI/BE lỗi
      }
    }, INTERVAL_MS);

    return () => clearInterval(interval);
  }, [videoDimensions]); // Dependency: Chạy lại khi có kích thước video thực

  // 3. Hàm vẽ Bounding Box lên video
  const drawBoxes = () => {
    if (!detections.length || !containerRef.current) return null;

    // Lấy kích thước hiển thị thực tế của video/container trên màn hình FE
    const displayWidth = containerRef.current.offsetWidth;
    const displayHeight = containerRef.current.offsetHeight;

    // Kích thước gốc của frame được AI xử lý (lấy từ videoDimensions)
    const originalWidth = videoDimensions.width;
    const originalHeight = videoDimensions.height;

    if (originalWidth === 0 || originalHeight === 0) return null;

    // Tính toán tỷ lệ giữa kích thước hiển thị và kích thước gốc
    const scaleX = displayWidth / originalWidth;
    const scaleY = displayHeight / originalHeight;

    return detections.map((detection, index) => {
      // Tọa độ bounding box (xyxy) từ AI Service, dựa trên kích thước gốc
      const [x1, y1, x2, y2] = detection.box;

      const label = detection.label.toUpperCase();
      // Phân biệt màu dựa trên nhãn
      const isFire = label.includes("FIRE");
      const boxColor = isFire ? "fire-box" : "fall-box";

      return (
        <div
          key={index}
          className={`bounding-box ${boxColor}`} // Thêm class màu
          style={{
            // Áp dụng tỷ lệ scaleX/scaleY cho tất cả tọa độ và kích thước
            left: `${x1 * scaleX}px`,
            top: `${y1 * scaleY}px`,
            width: `${(x2 - x1) * scaleX}px`,
            height: `${(y2 - y1) * scaleY}px`,
          }}
        >
          <span className="box-label">
            {`${label} (${detection.confidence})`}
          </span>
        </div>
      );
    });
  };

  return (
    <div className="camera-feed-wrapper">
      <h1 className="title">AI Real-time Detection (Fire & Fall)</h1>

      {/* Container chính chứa video và bounding box. Đảm bảo có position: relative */}
      <div
        ref={containerRef}
        className="camera-feed-container"
        style={{
          width: `${DEFAULT_WIDTH}px`,
          height: `${DEFAULT_HEIGHT}px`,
        }}
      >
        {/* Element hiển thị Video từ Camera */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          // Sử dụng kích thước mặc định để hiển thị, nhưng logic tính toán sẽ dùng videoDimensions (kích thước thực)
          width={DEFAULT_WIDTH}
          height={DEFAULT_HEIGHT}
          className="video-stream"
        />

        {/* Vị trí để hiển thị Bounding Box (Phần này phải nằm trên video) */}
        {drawBoxes()}
      </div>

      {/* Canvas ẩn để xử lý frame ảnh */}
      <canvas ref={canvasRef} className="hidden-canvas" />

      <div className="detection-status">
        {detections.length > 0 ? (
          <p className="status-active">
            ✅ Đang phát hiện {detections.length} đối tượng
          </p>
        ) : (
          <p className="status-inactive">⏳ Đang chờ phát hiện...</p>
        )}
        <p className="status-info">API URL: {API_URL}</p>
      </div>
    </div>
  );
}

export default CameraFeed;
