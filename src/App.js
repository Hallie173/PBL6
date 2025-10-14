import logo from './logo.svg';
import './App.css';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Header from './components/Header';
import Homepage from './Pages/Homepage';

function App() {
  return (
    <div className="App">
      <Header />
      <Router>
          <Routes>
            <Route path="/" element={<Homepage />} />
          </Routes>
      </Router>
    </div>
  );
}

export default App;
