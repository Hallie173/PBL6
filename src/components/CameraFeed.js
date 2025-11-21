import React, { useRef, useEffect, useState } from "react";

import axios from "axios";

import "./CameraFeed.scss";

const API_URL = "http://localhost:5000/api/detect_frame";

const INTERVAL_MS = 500;

export default function CameraFeed() {
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

      .catch(() =>
        alert("Không thể truy cập camera. Kiểm tra quyền truy cập.")
      );

    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

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

      try {
        const response = await axios.post(API_URL, { image: imageData });

        setDetections(response.data.detections);
      } catch (e) {
        console.error("API error", e);
      }
    }, INTERVAL_MS);

    return () => clearInterval(interval);
  }, [videoDimensions]);

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
          <span className="box-label">{`${label} (${det.confidence})`}</span>
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

        <p className="status-info">API URL: {API_URL}</p>
      </div>
    </div>
  );
}
