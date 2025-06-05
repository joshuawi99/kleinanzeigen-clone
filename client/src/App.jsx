import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateAd from './pages/CreateAd';
import MyAds from './pages/MyAds'; // ✅ NEU
import Header from './components/Header';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Geschützte Route: Anzeige erstellen */}
        <Route
          path="/create"
          element={
            <PrivateRoute>
              <CreateAd />
            </PrivateRoute>
          }
        />

        {/* Geschützte Route: Meine Anzeigen */}
        <Route
          path="/meine-anzeigen"
          element={
            <PrivateRoute>
              <MyAds />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
