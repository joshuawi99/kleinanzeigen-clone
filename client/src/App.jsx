import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateAd from './pages/CreateAd';
import MyAds from './pages/MyAds';
import EditAd from './pages/EditAd';
import Header from './components/Header';
import PrivateRoute from './components/PrivateRoute';
import AdDetails from './pages/AdDetails';
import MyProfile from './pages/MyProfile';

// Chat-Komponenten importieren
import ChatList from './components/ChatList';
import ChatRoom from './components/ChatRoom';

import { useState } from 'react';

function App() {
  const [selectedChat, setSelectedChat] = useState(null);

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

        {/* Geschützte Route: Mein Profil */}
        <Route
          path="/mein-profil"
          element={
            <PrivateRoute>
              <MyProfile />
            </PrivateRoute>
          }
        />

        {/* Geschützte Route: Chat */}
        <Route
          path="/chat"
          element={
            <PrivateRoute>
              <div style={{ display: 'flex', height: '100vh' }}>
                <ChatList onSelectChat={setSelectedChat} />
                {selectedChat && <ChatRoom chatId={selectedChat} />}
              </div>
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
