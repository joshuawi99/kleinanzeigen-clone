const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const verifyToken = require('../middleware/auth');
const { rateUser, getMe, getUser } = require('../controllers/userController');

const JWT_SECRET = process.env.JWT_SECRET || 'dein_geheimnis';

// Registrierung
router.post('/register', async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Benutzer mit dieser Email existiert bereits' });
    }
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ firstName, lastName, email, password: hash });

    res.status(201).json({
      message: 'Benutzer erstellt',
      user: { id: user._id, name: `${user.firstName} ${user.lastName}` }
    });
  } catch (err) {
    console.error('Fehler bei Registrierung:', err);
    res.status(500).json({ error: 'Serverfehler bei Registrierung' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Ungültige Daten' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Ungültiges Passwort' });

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });

    res.json({
      token,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: `${user.firstName} ${user.lastName}`
    });
  } catch (err) {
    console.error('Fehler beim Login:', err);
    res.status(500).json({ error: 'Serverfehler bei Login' });
  }
});

// Eigene Nutzerdaten abrufen
router.get('/me', verifyToken, getMe);

// Profil aktualisieren
router.put('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'Benutzer nicht gefunden' });

    const { firstName, lastName, email, password } = req.body;

    if (firstName) user.firstName = firstName;
    if (lastName)  user.lastName = lastName;
    if (email)     user.email = email;

    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();
    res.status(200).json({
      message: 'Profil aktualisiert',
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email
    });
  } catch (err) {
    console.error('❌ Fehler beim Profil-Update:', err);
    res.status(500).json({ error: 'Fehler beim Aktualisieren des Profils' });
  }
});

// Anderen Nutzer abrufen
router.get('/:id', getUser);

// Nutzer bewerten
router.post('/:id/rate', verifyToken, rateUser);

module.exports = router;
