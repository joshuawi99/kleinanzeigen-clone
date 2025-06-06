import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateAd from './pages/CreateAd';
import MyAds from './pages/MyAds'; // ✅ NEU
import EditAd from './pages/EditAd'; // 👈 NEU: EditAd importieren
import Header from './components/Header';
import PrivateRoute from './components/PrivateRoute';
import AdDetails from './pages/AdDetails';

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/ads/:id" element={<AdDetails />} />

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

        {/* Geschützte Route: Anzeige bearbeiten */}
        <Route
          path="/ads/edit/:id"
          element={
            <PrivateRoute>
              <EditAd />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
