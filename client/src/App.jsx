import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateAd from './pages/CreateAd';
import MyAds from './pages/MyAds';
import EditAd from './pages/EditAd';
import AdDetails from './pages/AdDetails';
import MyProfile from './pages/MyProfile';
import ChatPage from './pages/ChatPage'; // ✅ NEU

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
        <Route path="/ads/:id" element={<AdDetails />} />

        {/* Geschützte Routen */}
        <Route path="/create" element={<PrivateRoute><CreateAd /></PrivateRoute>} />
        <Route path="/meine-anzeigen" element={<PrivateRoute><MyAds /></PrivateRoute>} />
        <Route path="/ads/edit/:id" element={<PrivateRoute><EditAd /></PrivateRoute>} />
        <Route path="/mein-profil" element={<PrivateRoute><MyProfile /></PrivateRoute>} />
        <Route path="/chat" element={<PrivateRoute><ChatPage /></PrivateRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
