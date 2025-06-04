const mongoose = require('mongoose');

const adSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  price: Number,
  image: String, // später optional für Bild-URL oder Dateinamen
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Ad', adSchema);
