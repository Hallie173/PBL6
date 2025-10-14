import logo from "./logo.svg";
import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Header from "./components/Header";
import Homepage from "./Pages/Homepage";
import Sidebar from "./components/Sidebar";
import CameraList from "./Pages/CameraList";

function App() {
  return (
    <div className="App">
      <div className="main-content">
        <Router>
          <Header />
          <Sidebar />
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/camera-list" element={<CameraList />} />
            <Route path="/camera-history" element={<div>Lịch sử camera</div>} />
            <Route
              path="/alert-history"
              element={<div>Lịch sử cảnh báo</div>}
            />
            <Route
              path="/profile-edit"
              element={<div>Chỉnh sửa thông tin</div>}
            />
          </Routes>
        </Router>
      </div>
    </div>
  );
}

export default App;
