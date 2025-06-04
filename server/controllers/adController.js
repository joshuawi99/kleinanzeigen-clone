const Ad = require('../models/Ad');

exports.getAllAds = async (req, res) => {
  try {
    const ads = await Ad.find().sort({ createdAt: -1 });
    res.json(ads);
  } catch (err) {
    res.status(500).json({ error: 'Fehler beim Abrufen der Anzeigen' });
  }
};

exports.createAd = async (req, res) => {
  try {
    const newAd = new Ad(req.body);
    const savedAd = await newAd.save();
    res.status(201).json(savedAd);
  } catch (err) {
    res.status(400).json({ error: 'Fehler beim Erstellen der Anzeige' });
  }
};
