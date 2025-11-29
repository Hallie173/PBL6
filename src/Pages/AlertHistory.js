import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AlertHistory.scss";
import { Link } from "react-router-dom";

const API_BASE_URL = "http://localhost:8080/api/alerts";

function AlertHistory() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(API_BASE_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && response.data.alerts) {
        setAlerts(response.data.alerts);
      }
    } catch (err) {
      console.error("Fetch alerts error", err);
    }
  };

  const handleDelete = async (alertID) => {
    if (!window.confirm("Do you want to permanently delete this alert?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await axios.delete(`${API_BASE_URL}/${alertID}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.ok) {
        setAlerts((prevAlerts) =>
          prevAlerts.filter((alert) => alert.alertID !== alertID)
        );

        alert("Alert deleted!");
      } else {
        alert("Error deleting alert.");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("An error occurred while deleting the alert.");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("vi-VN");
  };

  return (
    <div className="alert-history">
      <h1 className="title">Lịch sử cảnh báo</h1>
      <div className="alert-container">
        {alerts.length > 0 ? (
          alerts.map((alert) => (
            <div key={alert.alertID} className="alert-item">
              <div className="alert-info">
                <h3
                  className="alert-title text-uppercase"
                  style={{ color: "red" }}
                >
                  {alert.alert_type?.toUpperCase() + " DETECTED" || "ALERT!"}
                </h3>
                <p className="alert-time">{formatDate(alert.created_at)}</p>
                <p className="alert-desc">{alert.content}</p>
              </div>

              <div className="alert-actions">
                <Link
                  to={`/alert-detail/${alert.alertID}`}
                  className="btn-detail"
                >
                  View Detail
                </Link>
                <button
                  className="btn-delete"
                  onClick={() => handleDelete(alert.alertID)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <p style={{ textAlign: "center" }}>No Alert Recorded.</p>
        )}
      </div>
    </div>
  );
}

export default AlertHistory;
