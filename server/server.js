const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express(); // <--- DAS HAT GEFEHLT!

app.use(cors());
app.use(express.json());

// MongoDB-Verbindung
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// Routen
const adRoutes = require('./routes/adRoutes');
app.use('/api/ads', adRoutes);

// Server starten
app.listen(5000, () => console.log('Server läuft auf Port 5000'));
