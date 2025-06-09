const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const Chat = require('./models/Chat');
const { init } = require('./socket'); // ⬅️ Socket initialisieren
require('dotenv').config();

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

// API-Routen
const adRoutes = require('./routes/adRoutes');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');

app.use('/api/ads', adRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chats', chatRoutes);
app.use('/uploads', express.static('uploads'));


// WebSocket initialisieren
init(server);

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB verbunden');
    server.listen(PORT, () => console.log(`🚀 Server läuft auf Port ${PORT}`));
  } catch (err) {
    console.error('❌ Fehler beim Start:', err);
    process.exit(1);
  }
}

startServer();
