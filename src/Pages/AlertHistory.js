import React from "react";
import "./AlertHistory.scss";

function AlertHistory() {
  const alerts = [
    {
      id: 1,
      title: "Cảnh báo nhiệt độ cao",
      time: "2025-01-10 14:20",
      description: "Nhiệt độ vượt ngưỡng 80°C trong 5 phút.",
    },
    {
      id: 2,
      title: "Cảnh báo mất kết nối",
      time: "2025-01-08 09:15",
      description: "Thiết bị mất tín hiệu trong 2 phút.",
    },
  ];

  return (
    <div className="alert-history">
      <h1 className="title">Lịch sử cảnh báo</h1>

      <div className="alert-container">
        {alerts.map((alert) => (
          <div key={alert.id} className="alert-item">
            <div className="alert-info">
              <h3 className="alert-title">{alert.title}</h3>
              <p className="alert-time">{alert.time}</p>
              <p className="alert-desc">{alert.description}</p>
            </div>

            <div className="alert-actions">
              <button className="btn-detail">Xem chi tiết</button>
              <button className="btn-delete">Xóa</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AlertHistory;
