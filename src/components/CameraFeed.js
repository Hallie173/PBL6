import React, { useRef, useEffect, useState } from "react";
import axios from "axios";
import "./CameraFeed.scss";

const FLASK_API_URL = "http://localhost:5000/api/detect_frame";
const NODE_API_URL = "http://localhost:8080/api/alerts/evidence";
const INTERVAL_MS = 500;
const CAPTURE_DURATION_SEC = 10;
const DEFAULT_WIDTH = 640;
const DEFAULT_HEIGHT = 480;

export default function CameraFeed() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const [alertLogs, setAlertLogs] = useState([]);
  const [detections, setDetections] = useState([]);
  const [videoDimensions, setVideoDimensions] = useState({
    width: 0,
    height: 0,
  });

  // State quản lý việc đang ghi hình
  const [isRecording, setIsRecording] = useState(false);

  // Khóa logic để tránh trigger trùng lặp khi đang xử lý
  const isLockedRef = useRef(false);

  // ==========================================
  // 1. CHỨC NĂNG ÂM THANH (3 BÍP)
  // ==========================================
  const playAlertSound = () => {
    // Kiểm tra trình duyệt có hỗ trợ không
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();

    // Hàm tạo 1 tiếng bíp ngắn
    const beep = (startTime) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = "sine"; // Sóng hình sin (nghe êm hơn square)
      osc.frequency.value = 880; // Tần số 880Hz (Nốt La cao - nghe rõ ràng)

      // Bắt đầu bíp
      osc.start(startTime);

      // Tắt sau 100ms (Bíp ngắn)
      osc.stop(startTime + 0.1);

      // Hiệu ứng fade out để không bị tiếng "bụp"
      gain.gain.setValueAtTime(1, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.1);
    };

    const now = ctx.currentTime;

    // YÊU CẦU: 3 tiếng bíp trong 1s, lặp lại 2 lần (Tổng 2s)
    // Chu kỳ 1 (Giây thứ 0)
    beep(now); // Bíp 1
    beep(now + 0.2); // Bíp 2 (cách 200ms)
    beep(now + 0.4); // Bíp 3 (cách 200ms)

    // Chu kỳ 2 (Giây thứ 1)
    beep(now + 1.0); // Bíp 1
    beep(now + 1.2); // Bíp 2
    beep(now + 1.4); // Bíp 3
  };

  // ==========================================
  // 2. SETUP CAMERA
  // ==========================================
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
      .catch((err) => alert("Không thể truy cập camera!"));

    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // ==========================================
  // 3. CAPTURE EVIDENCE SEQUENCE
  // ==========================================
  const captureEvidenceSequence = async (triggerType, userID) => {
    setIsRecording(true);

    // Kích hoạt âm thanh ngay khi bắt đầu alert
    playAlertSound();

    // Tạo Log mới
    const alertId = Date.now();
    const newLog = {
      id: alertId,
      time: new Date().toLocaleTimeString("vi-VN"),
      message: "Saving evidence...",
      status: "recording",
      type: triggerType,
    };
    setAlertLogs((prev) => [newLog, ...prev]);

    const sessionID = alertId;

    // Chụp 10 ảnh trong 10 giây
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
      } catch (error) {
        console.error("Image sending error:", error);
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // Cập nhật Log thành công
    setAlertLogs((prevLogs) =>
      prevLogs.map((log) =>
        log.id === alertId
          ? { ...log, message: "Evidence saved!", status: "done" }
          : log
      )
    );
    setIsRecording(false);
  };

  // ==========================================
  // 4. AI LOOP (SỬA ĐỔI QUAN TRỌNG)
  // ==========================================
  useEffect(() => {
    if (videoDimensions.width === 0) return;

    const interval = setInterval(async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (!video || !canvas || video.readyState !== 4) return;

      canvas.width = videoDimensions.width;
      canvas.height = videoDimensions.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = canvas.toDataURL("image/jpeg", 0.5);

      let currentUserID = null;
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          currentUserID = JSON.parse(userStr).userID;
        } catch {
          currentUserID = userStr;
        }
      }
      if (!currentUserID) return;

      try {
        const response = await axios.post(FLASK_API_URL, {
          image: imageData,
          userID: currentUserID,
        });

        // Cập nhật bounding box để vẽ
        setDetections(response.data.detections || []);

        // --- LOGIC MỚI: Chỉ Alert khi Server bảo thế ---
        const serverTrigger = response.data.alert_trigger; // Nhận cờ từ Python

        if (serverTrigger && !isLockedRef.current) {
          console.log("🚨 SERVER CONFIRMED ALERT:", serverTrigger);

          isLockedRef.current = true; // Khóa lại

          captureEvidenceSequence(serverTrigger, currentUserID).finally(() => {
            isLockedRef.current = false; // Mở khóa sau khi xong 10s
          });
        }
      } catch (e) {
        console.error("API Error", e);
      }
    }, INTERVAL_MS);

    return () => clearInterval(interval);
  }, [videoDimensions]);

  // ==========================================
  // 5. DRAW BOXES & RENDER (Giữ nguyên)
  // ==========================================
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
    <div className="camera-layout">
      <div className="camera-feed-wrapper">
        <div
          ref={containerRef}
          className="camera-feed-container"
          style={{
            width: videoDimensions.width
              ? `${videoDimensions.width * 1.1}px`
              : `${DEFAULT_WIDTH}px`,
            height: videoDimensions.height
              ? `${videoDimensions.height * 1.1}px`
              : `${DEFAULT_HEIGHT}px`,
          }}
        >
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            width={videoDimensions.width * 1.1 || DEFAULT_WIDTH}
            height={videoDimensions.height * 1.1 || DEFAULT_HEIGHT}
            className="video-stream"
          />
          {drawBoxes()}
        </div>
        <canvas ref={canvasRef} className="hidden-canvas" />
      </div>

      <div className="info-sidebar">
        <h3 className="sidebar-title">SECURITY MONITOR</h3>
        <div className="status-section">
          {detections.length ? (
            <p className="status-text status-active">
              ✅ Detected {detections.length} objects.
            </p>
          ) : (
            <p className="status-text status-inactive">
              ⏳ Waiting for detections...
            </p>
          )}
        </div>
        <div className="alert-list-container">
          <ul className="alert-list">
            {alertLogs.map((log) => (
              <li key={log.id} className="alert-item">
                <span className="alert-time">[{log.time}]</span>
                <span
                  className={
                    log.status === "recording"
                      ? "dot-indicator dot-recording"
                      : "dot-indicator"
                  }
                ></span>
                <span
                  className={`alert-msg ${
                    log.status === "done" ? "alert-msg-done" : ""
                  }`}
                >
                  {log.message}
                </span>
              </li>
            ))}
            {alertLogs.length === 0 && (
              <li className="alert-empty">No alert recorded.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
