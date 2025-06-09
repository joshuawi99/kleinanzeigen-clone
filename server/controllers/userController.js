const User = require('../models/User');

// ⭐ Nutzer bewerten
const rateUser = async (req, res) => {
  const targetUserId = req.params.id;
  const raterId = req.user.id;
  const { rating } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Ungültiger Bewertungswert (1–5 erlaubt)' });
  }

  try {
    const user = await User.findById(targetUserId);
    if (!user) return res.status(404).json({ error: 'Benutzer nicht gefunden' });

    const alreadyRated = user.ratings.find(r => r.userId?.toString() === raterId);
    if (alreadyRated) {
      return res.status(400).json({ error: 'Du hast diesen Nutzer bereits bewertet' });
    }

    user.ratings.push({ userId: raterId, rating });
    await user.save();
    res.status(200).json({ message: 'Bewertung gespeichert', averageRating: user.averageRating });
  } catch (err) {
    console.error('Fehler beim Bewerten:', err);
    res.status(500).json({ error: 'Serverfehler beim Bewerten' });
  }
};

// 🙋 Eigene Nutzerdaten abrufen
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('firstName lastName email ratings');
    if (!user) return res.status(404).json({ error: 'Benutzer nicht gefunden' });
    res.status(200).json(user);
  } catch (err) {
    console.error('Fehler bei /me:', err);
    res.status(500).json({ error: 'Serverfehler bei Profilabruf' });
  }
};

// 📄 Öffentliche Nutzerdaten abrufen
const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('firstName lastName ratings');
    if (!user) return res.status(404).json({ error: 'Benutzer nicht gefunden' });

    const totalRatings = user.ratings.length;
    const average =
      totalRatings > 0
        ? (user.ratings.reduce((acc, r) => acc + r.rating, 0) / totalRatings).toFixed(1)
        : null;

    res.status(200).json({
      name: `${user.firstName} ${user.lastName}`,
      averageRating: average,
      totalRatings
    });
  } catch (err) {
    console.error('Fehler beim Abrufen des Nutzers:', err);
    res.status(500).json({ error: 'Serverfehler beim Abruf' });
  }
};

module.exports = { rateUser, getMe, getUser };
