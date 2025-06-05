import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateAd from './pages/CreateAd';            // 👈 NEU
import Header from './components/Header';
import PrivateRoute from './components/PrivateRoute'; // 👈 NEU

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Geschützte Route für Anzeige erstellen */}
        <Route
          path="/create"
          element={
            <PrivateRoute>
              <CreateAd />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
