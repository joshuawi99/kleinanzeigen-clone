const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*', // oder Frontend-URL
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// Importiere Routen
const adRoutes = require('./routes/adRoutes');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');

app.use('/api/ads', adRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chats', chatRoutes);

// Socket.IO Chat-Logik
io.on('connection', (socket) => {
  console.log('Neuer Client verbunden:', socket.id);

  socket.on('joinChat', (chatId) => {
    socket.join(chatId);
    console.log(`Socket ${socket.id} joined chat ${chatId}`);
  });

  socket.on('leaveChat', (chatId) => {
    socket.leave(chatId);
    console.log(`Socket ${socket.id} left chat ${chatId}`);
  });

  socket.on('sendMessage', async ({ chatId, senderId, text }) => {
    // Nachricht in DB speichern
    try {
      const chat = await Chat.findById(chatId);
      if (!chat) return;

      const message = { sender: senderId, text, createdAt: new Date() };
      chat.messages.push(message);
      await chat.save();

      // Nachricht an alle im Chat senden
      io.to(chatId).emit('receiveMessage', {
        senderId,
        text,
        createdAt: message.createdAt
      });
    } catch (err) {
      console.error('Fehler beim Senden der Nachricht:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
    server.listen(PORT, () => console.log(`Server läuft auf Port ${PORT}`));
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

startServer();
