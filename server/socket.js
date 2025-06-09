let io = null;

function init(server) {
  const { Server } = require('socket.io');
  io = new Server(server, {
    cors: {
      origin: 'http://localhost:5173',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    const token = socket.handshake.auth?.token;
    if (!token) return;

    try {
      const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET);
      socket.join(decoded.userId); // 🎯 Raum für gezielte Events
    } catch (err) {
      console.error('❌ Socket Auth-Fehler:', err.message);
    }

    socket.on('joinChat', (chatId) => {
      socket.join(chatId);
    });

    socket.on('leaveChat', (chatId) => {
      socket.leave(chatId);
    });

    socket.on('sendMessage', async ({ chatId, senderId, text }) => {
      try {
        const chat = await require('./models/Chat').findById(chatId);
        if (!chat) return;

        const message = { sender: senderId, text, createdAt: new Date() };
        chat.messages.push(message);
        await chat.save();

        io.to(chatId).emit('receiveMessage', {
          chatId,
          senderId,
          text,
          createdAt: message.createdAt
        });

        chat.participants.forEach(participantId => {
          if (participantId.toString() !== senderId) {
            io.to(participantId.toString()).emit('newMessage', {
              chatId,
              senderId,
              text,
              createdAt: message.createdAt,
              to: participantId.toString()
            });
          }
        });
      } catch (err) {
        console.error('❌ Fehler beim Senden der Nachricht:', err);
      }
    });

    socket.on('disconnect', () => {
      console.log('🔴 Socket disconnected');
    });
  });
}

function getIO() {
  if (!io) throw new Error('Socket.io ist nicht initialisiert');
  return io;
}

module.exports = { init, getIO };
