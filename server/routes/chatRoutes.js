const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Chat = require('../models/Chat');

// Neue Chat erstellen / vorhandenen holen
router.post('/', auth, async (req, res) => {
  const { recipientId } = req.body;
  const userId = req.user.id;

  try {
    let chat = await Chat.findOne({
      participants: { $all: [userId, recipientId] }
    });

    if (!chat) {
      chat = new Chat({ participants: [userId, recipientId], messages: [] });
      await chat.save();
    }

    res.json(chat);
  } catch (err) {
    res.status(500).json({ error: 'Chat konnte nicht geladen werden' });
  }
});

// Nachrichten eines Chats laden
router.get('/:chatId', auth, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId)
      .populate('messages.sender', 'username')
      .populate('participants', 'username');
    if (!chat) return res.status(404).json({ error: 'Chat nicht gefunden' });
    res.json(chat);
  } catch (err) {
    res.status(500).json({ error: 'Fehler beim Laden der Nachrichten' });
  }
});

module.exports = router;
