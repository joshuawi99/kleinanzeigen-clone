const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Chat = require('../models/Chat');
const mongoose = require('mongoose');
const { getIO } = require('../socket');

// 🔁 Neuen Chat erstellen oder bestehenden holen
router.post('/', auth, async (req, res) => {
  const { recipientId } = req.body;
  const userId = req.user.id;

  try {
    let chat = await Chat.findOne({
      participants: { $all: [userId, recipientId] }
    }).populate('participants', 'firstName lastName');

    if (!chat) {
      const newChat = new Chat({
        participants: [userId, recipientId],
        messages: []
      });
      await newChat.save();

      chat = await Chat.findById(newChat._id).populate('participants', 'firstName lastName');

      const io = getIO();
      io.to(userId).emit('chatCreated', chat);
      io.to(recipientId).emit('chatCreated', chat);
    }

    res.json(chat);
  } catch (err) {
    console.error('❌ Fehler beim Erstellen/Holen des Chats:', err);
    res.status(500).json({ error: 'Serverfehler beim Chat erstellen' });
  }
});

// 📄 Alle Chats des Users
router.get('/', auth, async (req, res) => {
  try {
    const chats = await Chat.find({ participants: req.user.id })
      .populate('participants', 'firstName lastName')
      .sort({ updatedAt: -1 });

    res.json(chats);
  } catch (err) {
    console.error('❌ Fehler beim Laden der Chats:', err);
    res.status(500).json({ error: 'Fehler beim Laden der Chats' });
  }
});

// 🧾 Einzelner Chat
router.get('/:chatId', auth, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId)
      .populate('messages.sender', 'firstName lastName')
      .populate('participants', 'firstName lastName');

    if (!chat) return res.status(404).json({ error: 'Chat nicht gefunden' });

    const isParticipant = chat.participants.some(
      p => p._id.toString() === req.user.id
    );
    if (!isParticipant) {
      return res.status(403).json({ error: 'Kein Zugriff auf diesen Chat' });
    }

    res.json(chat);
  } catch (err) {
    console.error('❌ Fehler beim Abrufen des Chatverlaufs:', err);
    res.status(500).json({ error: 'Fehler beim Abrufen der Nachrichten' });
  }
});

// ❌ Chat löschen
router.delete('/:chatId', auth, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) return res.status(404).json({ error: 'Chat nicht gefunden' });

    if (!chat.participants.includes(req.user.id)) {
      return res.status(403).json({ error: 'Kein Zugriff auf diesen Chat' });
    }

    await chat.deleteOne();

    const io = getIO();
    chat.participants.forEach(participant => {
      io.to(participant.toString()).emit('chatDeleted', req.params.chatId);
    });

    res.status(200).json({ message: 'Chat gelöscht' });
  } catch (err) {
    console.error('❌ Fehler beim Löschen des Chats:', err);
    res.status(500).json({ error: 'Fehler beim Löschen des Chats' });
  }
});

module.exports = router;
