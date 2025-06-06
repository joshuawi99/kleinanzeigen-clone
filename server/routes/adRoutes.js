const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const Ad = require('../models/Ad');
const axios = require('axios');
const auth = require('../middleware/auth');

// POST: Neue Anzeige mit Bild, Kategorie, PLZ → Ort und User-ID speichern
router.post('/', auth, upload.single('image'), async (req, res) => {
  const { title, description, price, category, zipCode } = req.body;
  const image = req.file ? req.file.filename : null;

  // PLZ → Stadtname über API auflösen
  let location = 'Unbekannt';
  try {
    const response = await axios.get(`https://api.zippopotam.us/de/${zipCode}`);
    location = response.data.places?.[0]['place name'] || 'Unbekannt';
  } catch (err) {
    console.warn('PLZ nicht gefunden oder API-Fehler:', zipCode);
  }

  try {
    const newAd = new Ad({
      title,
      description,
      price,
      category,
      zipCode,
      location,
      image,
      userId: req.user.id.toString() // User-ID aus Token speichern (auth Middleware setzt req.user)
    });

    const savedAd = await newAd.save();
    res.status(201).json(savedAd);
  } catch (err) {
    console.error('Fehler beim Speichern:', err);
    res.status(400).json({ error: 'Fehler beim Erstellen der Anzeige' });
  }
});

// PUT: Anzeige bearbeiten (nur vom Eigentümer)
router.put('/:id', auth, upload.single('image'), async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);
    if (!ad) return res.status(404).json({ error: 'Anzeige nicht gefunden' });

    // Prüfe Eigentümerschaft
    if (ad.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Nicht berechtigt' });
    }

    const { title, description, price, category, zipCode } = req.body;

    // PLZ geändert? Ort neu ermitteln
    let location = ad.location;
    if (zipCode && zipCode !== ad.zipCode) {
      try {
        const response = await axios.get(`https://api.zippopotam.us/de/${zipCode}`);
        location = response.data.places?.[0]['place name'] || 'Unbekannt';
      } catch {
        location = 'Unbekannt';
      }
    }

    // Felder aktualisieren (nur wenn neue Werte vorhanden)
    ad.title = title || ad.title;
    ad.description = description || ad.description;
    ad.price = price || ad.price;
    ad.category = category || ad.category;
    ad.zipCode = zipCode || ad.zipCode;
    ad.location = location;

    if (req.file) ad.image = req.file.filename;

    const updated = await ad.save();
    res.json(updated);
  } catch (err) {
    console.error('Fehler beim Aktualisieren:', err);
    res.status(500).json({ error: 'Fehler beim Aktualisieren' });
  }
});

// GET: Alle Anzeigen (für öffentliche Ansicht)
router.get('/', async (req, res) => {
  try {
    const ads = await Ad.find().sort({ createdAt: -1 });
    res.json(ads);
  } catch (err) {
    console.error('Fehler beim Abrufen aller Anzeigen:', err);
    res.status(500).json({ error: 'Fehler beim Abrufen der Anzeigen' });
  }
});

// GET: Eigene Anzeigen (authentifiziert)
router.get('/my', auth, async (req, res) => {
  try {
    const userAds = await Ad.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(userAds);
  } catch (err) {
    console.error('Fehler beim Abrufen eigener Anzeigen:', err);
    res.status(500).json({ error: 'Fehler beim Abrufen der eigenen Anzeigen' });
  }
});

// NEU: GET einzelne Anzeige nach ID
router.get('/:id', async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);
    if (!ad) return res.status(404).json({ error: 'Anzeige nicht gefunden' });
    res.json(ad);
  } catch (err) {
    console.error('Fehler beim Abrufen der Anzeige:', err);
    res.status(500).json({ error: 'Serverfehler beim Abrufen der Anzeige' });
  }
});

module.exports = router;
