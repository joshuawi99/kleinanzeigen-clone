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

import Header from './components/Header';
import PrivateRoute from './components/PrivateRoute';
import ChatList from './components/ChatList';
import ChatRoom from './components/ChatRoom';

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
        <Route path="/create" element={<PrivateRoute><CreateAd /></PrivateRoute>} />
        <Route path="/my-ads" element={<PrivateRoute><MyAds /></PrivateRoute>} /> {/* ✅ angepasst */}
        <Route path="/ads/edit/:id" element={<PrivateRoute><EditAd /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><MyProfile /></PrivateRoute>} /> {/* ✅ angepasst */}

        {/* Chat-Bereich */}
        <Route
          path="/chat"
          element={
            <PrivateRoute>
              <div style={{ display: 'flex', height: '100vh' }}>
                <ChatList onSelectChat={setSelectedChat} />
                <ChatRoom chatId={selectedChat} />
              </div>
            </PrivateRoute>
          }
        />

        {/* 404-Fallback */}
        <Route path="*" element={<div className="p-4">Seite nicht gefunden</div>} />
      </Routes>
    </Router>
  );
}

export default App;
