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
import CameraHistory from "./Pages/CameraHistory";
import AlertHistory from "./Pages/AlertHistory";
import EditProfile from "./Pages/EditProfile";

function App() {
  return (
    <div className="App">
      <div className="main-content">
        <Router>
          <Header />
          <Sidebar />
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/edit-profile" element={<EditProfile />} />
            <Route path="/camera-history" element={<CameraHistory />} />
            <Route path="/alert-history" element={<AlertHistory />} />
          </Routes>
        </Router>
      </div>
    </div>
  );
}

export default App;
