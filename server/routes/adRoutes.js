const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const Ad = require('../models/Ad');
const axios = require('axios');
const auth = require('../middleware/auth');

// Funktion: Adresse zu Koordinaten und Adresse mit Nominatim
async function getCoordinates(street, houseNumber, zipCode, city) {
  try {
    let queryParts = [];
    if (street) queryParts.push(street);
    if (houseNumber) queryParts.push(houseNumber);
    if (zipCode) queryParts.push(zipCode);
    if (city) queryParts.push(city);
    queryParts.push('Germany'); // Land als Teil der Suche

    const query = queryParts.join(', ');

    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: query,
        format: 'json',
        addressdetails: 1,
        limit: 1,
      },
      headers: {
        'User-Agent': 'Kleinanzeigen-App (deine-email@domain.de)'
      }
    });

    if (response.data.length === 0) return null;
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
    console.warn('Fehler bei Geokodierung:', err.message);
    return null;
  }
}

// POST: Neue Anzeige erstellen
router.post('/', auth, upload.single('image'), async (req, res) => {
  let { title, description, price, category, zipCode, location, street, houseNumber, city } = req.body;
  const image = req.file ? req.file.filename : null;

  const coords = await getCoordinates(street, houseNumber, zipCode, city || location);

  if (coords) {
    if (!street) street = coords.street;
    if (!houseNumber) houseNumber = coords.houseNumber;
    if (!city) city = coords.city;
  }

  let fullLocation = location || 'Unbekannt';
  const addressParts = [];
  if (street) addressParts.push(street);
  if (houseNumber) addressParts.push(houseNumber);
  if (coords && coords.postcode) addressParts.push(coords.postcode);
  if (city) addressParts.push(city);

  if (addressParts.length > 0) {
    fullLocation = addressParts.join(', ');
  }

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
      latitude: coords ? coords.lat : null,
      longitude: coords ? coords.lon : null,
      image,
      userId: req.user.id.toString(),
    });

    const savedAd = await newAd.save();
    res.status(201).json(savedAd);
  } catch (err) {
    console.error('Fehler beim Speichern:', err);
    res.status(400).json({ error: 'Fehler beim Erstellen der Anzeige' });
  }
});

// PUT: Anzeige bearbeiten
router.put('/:id', auth, upload.single('image'), async (req, res) => {

  if (!req.params.id) {
    return res.status(400).json({ error: 'Keine ID im Pfad übergeben' });
  }

  try {
    const ad = await Ad.findById(req.params.id);
    if (!ad) return res.status(404).json({ error: 'Anzeige nicht gefunden' });

    if (ad.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Nicht berechtigt' });
    }

    let { title, description, price, category, zipCode, location, street, houseNumber, city } = req.body;

    const coordsChanged =
      zipCode !== ad.zipCode ||
      street !== ad.street ||
      houseNumber !== ad.houseNumber ||
      city !== ad.city;

    const coords = coordsChanged
      ? await getCoordinates(street, houseNumber, zipCode, city || location)
      : null;

    if (coords) {
      if (!street) street = coords.street;
      if (!houseNumber) houseNumber = coords.houseNumber;
      if (!city) city = coords.city;
    }

    let fullLocation = location || ad.location;
    const addressParts = [];
    if (street) addressParts.push(street);
    if (houseNumber) addressParts.push(houseNumber);
    if (coords && coords.postcode) addressParts.push(coords.postcode);
    if (city) addressParts.push(city);

    if (addressParts.length > 0) {
      fullLocation = addressParts.join(', ');
    }

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
    console.error('Fehler beim Aktualisieren:', err);
    res.status(500).json({ error: 'Fehler beim Aktualisieren' });
  }
});

// DELETE: Anzeige löschen (nur vom Eigentümer)
router.delete('/:id', auth, async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);
    if (!ad) return res.status(404).json({ error: 'Anzeige nicht gefunden' });

    if (ad.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Nicht berechtigt' });
    }

    await Ad.deleteOne({ _id: req.params.id });
    res.json({ message: 'Anzeige gelöscht' });
  } catch (err) {
    console.error('Fehler beim Löschen:', err);
    res.status(500).json({ error: 'Fehler beim Löschen der Anzeige' });
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

// GET einzelne Anzeige nach ID
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
