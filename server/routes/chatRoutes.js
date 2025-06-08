const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Chat = require('../models/Chat');
const mongoose = require('mongoose');

// 🔁 POST: Neuen Chat erstellen (oder bestehenden holen)
router.post('/', auth, async (req, res) => {
  const { recipientId } = req.body;
  const userId = req.user.id;

  try {
    let chat = await Chat.findOne({
      participants: { $all: [userId, recipientId] }
    });

    if (!chat) {
      chat = new Chat({
        participants: [userId, recipientId],
        messages: []
      });
      await chat.save();
    }

    res.json(chat);
  } catch (err) {
    console.error('❌ Fehler beim Erstellen/Holen des Chats:', err);
    res.status(500).json({ error: 'Serverfehler beim Chat erstellen' });
  }
});

// 📄 GET: Alle Chats des Users
router.get('/', auth, async (req, res) => {
  try {
    const chats = await Chat.find({ participants: req.user.id })
      .populate('participants', 'username')
      .sort({ updatedAt: -1 });

    res.json(chats);
  } catch (err) {
    console.error('❌ Fehler beim Laden der Chats:', err);
    res.status(500).json({ error: 'Fehler beim Laden der Chats' });
  }
});

// 🧾 GET: Einzelner Chat mit Nachrichten
router.get('/:chatId', auth, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId)
      .populate('messages.sender', 'username')
      .populate('participants', 'username');

    if (!chat) {
      return res.status(404).json({ error: 'Chat nicht gefunden' });
    }

    // Zugriff prüfen anhand ObjectId-Vergleich
    const participantIds = chat.participants.map(p =>
      new mongoose.Types.ObjectId(p._id).toString()
    );
    const requesterId = new mongoose.Types.ObjectId(req.user.id).toString();

    if (!participantIds.includes(requesterId)) {
      console.warn('🚫 Zugriff verweigert. Teilnehmer:', participantIds, 'Anfragender:', requesterId);
      return res.status(403).json({ error: 'Kein Zugriff auf diesen Chat' });
    }

    res.json(chat);
  } catch (err) {
    console.error('❌ Fehler beim Abrufen des Chatverlaufs:', err);
    res.status(500).json({ error: 'Fehler beim Abrufen der Nachrichten' });
  }
});

module.exports = router;
