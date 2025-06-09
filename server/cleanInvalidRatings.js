// cleanInvalidRatings.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');

async function cleanInvalidRatings() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const result = await User.updateMany(
      {},
      { $pull: { ratings: { userId: { $exists: false } } } }
    );

    console.log('Ungültige Bewertungen bereinigt:', result.modifiedCount, 'Benutzer aktualisiert.');
    await mongoose.disconnect();
  } catch (err) {
    console.error('Fehler beim Bereinigen:', err);
    process.exit(1);
  }
}

cleanInvalidRatings();
