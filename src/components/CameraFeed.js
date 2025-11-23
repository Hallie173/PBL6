import React, { useRef, useEffect, useState } from "react";
import axios from "axios";
import "./CameraFeed.scss";

const FLASK_API_URL = "http://localhost:5000/api/detect_frame";
const NODE_API_URL = "http://localhost:8080/api/alerts/evidence";
const INTERVAL_MS = 500;
const CAPTURE_DURATION_SEC = 10;
const DEFAULT_WIDTH = 640;
const DEFAULT_HEIGHT = 480;

// Cooldown 30 giây giữa 2 alert liên tiếp của cùng loại
const ALERT_COOLDOWN_MS = 30000;

export default function CameraFeed() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Detections render
  const [detections, setDetections] = useState([]);

  // Camera dimension
  const [videoDimensions, setVideoDimensions] = useState({
    width: 0,
    height: 0,
  });

  // Đang record (UI)
  const [isRecording, setIsRecording] = useState(false);

  // Khóa cứng, không phụ thuộc vào React re-render
  const isLockedRef = useRef(false);

  // Lưu cooldown cho từng loại sự kiện
  const lastAlertTimestamp = useRef({
    FIRE: 0,
    FALL: 0,
  });

  // ================================
  // 1. SETUP CAMERA
  // ================================
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: { width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT } })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            setVideoDimensions({
              width: videoRef.current.videoWidth,
              height: videoRef.current.videoHeight,
            });
          };
        }
      })
      .catch((err) =>
        alert("Không thể truy cập camera. Kiểm tra quyền truy cập.")
      );

    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // ==========================================
  // 2. CAPTURE EVIDENCE (10 images / 10 secs)
  // ==========================================
  const captureEvidenceSequence = async (triggerType, userID) => {
    setIsRecording(true);
    console.log(`📸 Bắt đầu chuỗi bằng chứng: ${triggerType}`);

    const sessionID = Date.now();

    for (let i = 0; i < CAPTURE_DURATION_SEC; i++) {
      if (!videoRef.current || !canvasRef.current) break;

      try {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const snapshotData = canvas.toDataURL("image/jpeg", 0.7);

        await axios.post(NODE_API_URL, {
          userID,
          image: snapshotData,
          alertType: triggerType,
          sessionID,
          sequenceIndex: i + 1,
          timestamp: Date.now(),
        });

        console.log(`📤 Đã gửi ảnh bằng chứng ${i + 1}/10`);
      } catch (error) {
        console.error("Lỗi gửi ảnh bằng chứng:", error);
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    console.log("✅ Hoàn tất bằng chứng.");
    setIsRecording(false);
  };

  // ================================================
  // 3. AI LOOP – gửi frame lên Flask mỗi 500ms
  // ================================================
  useEffect(() => {
    if (videoDimensions.width === 0) return;

    const interval = setInterval(async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (!video || !canvas || video.readyState !== 4) return;

      // Vẽ video vào canvas
      canvas.width = videoDimensions.width;
      canvas.height = videoDimensions.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = canvas.toDataURL("image/jpeg", 0.5);

      // LẤY USER ID
      let currentUserID = null;
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          currentUserID = JSON.parse(userStr).userID;
        } catch {
          currentUserID = userStr;
        }
      }

      if (!currentUserID) {
        console.warn("Không tìm thấy userID");
        return;
      }

      try {
        const response = await axios.post(FLASK_API_URL, {
          image: imageData,
          userID: currentUserID,
        });

        const currentDetections = response.data.detections || [];
        setDetections(currentDetections);

        // Nếu đang record → không trigger alert mới
        if (isLockedRef.current) return;

        // Tìm Fire/Fall
        const danger = currentDetections.find((d) =>
          ["FIRE", "FALL"].includes(d.label.toUpperCase())
        );

        if (danger) {
          const type = danger.label.toUpperCase();

          // Cooldown 30s
          const now = Date.now();
          if (now - lastAlertTimestamp.current[type] < ALERT_COOLDOWN_MS) {
            console.log(`⏳ ${type} còn cooldown, bỏ qua.`);
            return;
          }

          // KÍCH HOẠT ALERT
          isLockedRef.current = true; // khóa ngay lập tức
          lastAlertTimestamp.current[type] = now;

          captureEvidenceSequence(type, currentUserID).finally(() => {
            isLockedRef.current = false; // mở khóa sau chuỗi
          });
        }
      } catch (e) {
        console.error("API Flask error", e);
      }
    }, INTERVAL_MS);

    return () => clearInterval(interval);
  }, [videoDimensions]);

  // =======================================
  // 4. DRAW BOXES
  // =======================================
  const drawBoxes = () => {
    if (!detections.length || !containerRef.current) return null;

    const displayWidth = containerRef.current.offsetWidth;
    const displayHeight = containerRef.current.offsetHeight;
    const { width: originalWidth, height: originalHeight } = videoDimensions;

    const scaleX = displayWidth / originalWidth;
    const scaleY = displayHeight / originalHeight;

    return detections.map((det, i) => {
      const [x1, y1, x2, y2] = det.box;
      const label = det.label.toUpperCase();

      const classMap = {
        FIRE: "fire-box",
        SMOKE: "smoke-box",
        FALL: "fall-box",
      };

      return (
        <div
          key={i}
          className={`bounding-box ${classMap[label] || "unknown-box"}`}
          style={{
            left: `${x1 * scaleX}px`,
            top: `${y1 * scaleY}px`,
            width: `${(x2 - x1) * scaleX}px`,
            height: `${(y2 - y1) * scaleY}px`,
          }}
        >
          <span className="box-label">
            {label} ({det.confidence})
          </span>
        </div>
      );
    });
  };

  return (
    <div className="camera-feed-wrapper">
      <div
        ref={containerRef}
        className="camera-feed-container"
        style={{ width: `${DEFAULT_WIDTH}px`, height: `${DEFAULT_HEIGHT}px` }}
      >
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          width={DEFAULT_WIDTH}
          height={DEFAULT_HEIGHT}
          className="video-stream"
        />
        {drawBoxes()}
        {isRecording && (
          <div className="recording-indicator">
            🔴 Đang lưu bằng chứng...
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden-canvas" />

      <div className="detection-status">
        {detections.length ? (
          <p className="status-active">
            ✅ Phát hiện {detections.length} đối tượng
          </p>
        ) : (
          <p className="status-inactive">⏳ Đang chờ phát hiện...</p>
        )}
        <p className="status-info">API URL: {FLASK_API_URL}</p>
      </div>
    </div>
  );
}
