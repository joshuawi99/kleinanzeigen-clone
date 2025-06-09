const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const Ad = require('../models/Ad');
const axios = require('axios');
const auth = require('../middleware/auth');

// 🔍 Adresse → Koordinaten via Nominatim
async function getCoordinates(street, houseNumber, zipCode, city) {
  try {
    const queryParts = [street, houseNumber, zipCode, city, 'Germany'].filter(Boolean);
    const query = queryParts.join(', ');

    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: query,
        format: 'json',
        addressdetails: 1,
        limit: 1,
      },
      headers: {
        'User-Agent': 'Kleinanzeigen-App (kontakt@beispiel.de)',
      },
    });

    if (!response.data.length) return null;
    const place = response.data[0];
    const addr = place.address || {};

    return {
      lat: parseFloat(place.lat),
      lon: parseFloat(place.lon),
      displayName: place.display_name,
      street: addr.road || '',
      houseNumber: addr.house_number || '',
      city: addr.city || addr.town || addr.village || '',
      postcode: addr.postcode || '',
    };
  } catch (err) {
    console.warn('⚠️ Fehler bei Geokodierung:', err.message);
    return null;
  }
}

// 📦 Neue Anzeige erstellen (Einzel-/Mehrfachbild)
router.post('/', auth, upload.fields([{ name: 'image' }, { name: 'images' }]), async (req, res) => {
  let { title, description, price, category, zipCode, location, street, houseNumber, city } = req.body;
  const singleImage = req.files?.image?.[0]?.filename || null;
  const imageArray = req.files?.images?.map(file => file.filename) || [];

  const coords = await getCoordinates(street, houseNumber, zipCode, city || location);

  if (coords) {
    street = street || coords.street;
    houseNumber = houseNumber || coords.houseNumber;
    city = city || coords.city;
  }

  const addressParts = [street, houseNumber, coords?.postcode, city].filter(Boolean);
  const fullLocation = addressParts.length ? addressParts.join(', ') : location || 'Unbekannt';

  try {
    const newAd = new Ad({
      title,
      description,
      price,
      category,
      zipCode,
      location: fullLocation,
      street,
      houseNumber,
      city,
      latitude: coords?.lat || null,
      longitude: coords?.lon || null,
      image: singleImage,
      images: imageArray,
      userId: req.user.id,
    });

    const savedAd = await newAd.save();
    res.status(201).json(savedAd);
  } catch (err) {
    console.error('❌ Fehler beim Speichern:', err);
    res.status(400).json({ error: 'Fehler beim Erstellen der Anzeige' });
  }
});

// ✏️ Anzeige bearbeiten
router.put('/:id', auth, upload.single('image'), async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);
    if (!ad) return res.status(404).json({ error: 'Anzeige nicht gefunden' });
    if (ad.userId.toString() !== req.user.id) return res.status(403).json({ error: 'Nicht berechtigt' });

    let { title, description, price, category, zipCode, location, street, houseNumber, city } = req.body;
    const coordsChanged = zipCode !== ad.zipCode || street !== ad.street || houseNumber !== ad.houseNumber || city !== ad.city;
    const coords = coordsChanged ? await getCoordinates(street, houseNumber, zipCode, city || location) : null;

    if (coords) {
      street = street || coords.street;
      houseNumber = houseNumber || coords.houseNumber;
      city = city || coords.city;
    }

    const addressParts = [street, houseNumber, coords?.postcode, city].filter(Boolean);
    const fullLocation = addressParts.length ? addressParts.join(', ') : ad.location;

    ad.title = title || ad.title;
    ad.description = description || ad.description;
    ad.price = price || ad.price;
    ad.category = category || ad.category;
    ad.zipCode = zipCode || ad.zipCode;
    ad.location = fullLocation;
    ad.street = street || ad.street;
    ad.houseNumber = houseNumber || ad.houseNumber;
    ad.city = city || ad.city;

    if (coords) {
      ad.latitude = coords.lat;
      ad.longitude = coords.lon;
    }

    if (req.file) ad.image = req.file.filename;

    const updated = await ad.save();
    res.json(updated);
  } catch (err) {
    console.error('❌ Fehler beim Aktualisieren:', err);
    res.status(500).json({ error: 'Fehler beim Aktualisieren' });
  }
});

// 🗑️ Anzeige löschen
router.delete('/:id', auth, async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);
    if (!ad) return res.status(404).json({ error: 'Anzeige nicht gefunden' });
    if (ad.userId.toString() !== req.user.id) return res.status(403).json({ error: 'Nicht berechtigt' });

    await Ad.deleteOne({ _id: req.params.id });
    res.json({ message: 'Anzeige gelöscht' });
  } catch (err) {
    console.error('❌ Fehler beim Löschen:', err);
    res.status(500).json({ error: 'Fehler beim Löschen der Anzeige' });
  }
});

// 🔍 Alle Anzeigen (öffentlich)
router.get('/', async (req, res) => {
  try {
    const ads = await Ad.find().sort({ createdAt: -1 });
    res.json(ads);
  } catch (err) {
    console.error('❌ Fehler beim Abrufen aller Anzeigen:', err);
    res.status(500).json({ error: 'Fehler beim Abrufen der Anzeigen' });
  }
});

// 🔐 Eigene Anzeigen
router.get('/my', auth, async (req, res) => {
  try {
    const myAds = await Ad.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(myAds);
  } catch (err) {
    console.error('❌ Fehler beim Abrufen eigener Anzeigen:', err);
    res.status(500).json({ error: 'Fehler beim Abrufen der eigenen Anzeigen' });
  }
});

// 🧾 Einzelne Anzeige (nur wenn gültige ObjectId)
router.get('/:id([0-9a-fA-F]{24})', async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);
    if (!ad) return res.status(404).json({ error: 'Anzeige nicht gefunden' });
    res.json(ad);
  } catch (err) {
    console.error('❌ Fehler beim Abrufen der Anzeige:', err);
    res.status(500).json({ error: 'Fehler beim Abrufen der Anzeige' });
  }
});

module.exports = router;
