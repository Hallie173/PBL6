import logo from "./logo.svg";
import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Homepage from "./Pages/Homepage";
import CameraHistory from "./Pages/CameraHistory";
import AlertHistory from "./Pages/AlertHistory";
import EditProfile from "./Pages/EditProfile";
import MainLayout from "./components/MainLayout";
import LoginPage from "./Pages/LoginPage";
import SignupPage from "./Pages/SignupPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <MainLayout>
              <Homepage />
            </MainLayout>
          }
        />
        <Route
          path="/edit-profile"
          element={
            <MainLayout>
              <EditProfile />
            </MainLayout>
          }
        />
        <Route
          path="/camera-history"
          element={
            <MainLayout>
              <CameraHistory />
            </MainLayout>
          }
        />
        <Route
          path="/alert-history"
          element={
            <MainLayout>
              <AlertHistory />
            </MainLayout>
          }
        />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Routes>
    </Router>
  );
}

export default App;
