const mongoose = require('mongoose');

const adSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  image: String,
  category: String,
  zipCode: String,
  location: String,
  street: String,      // NEU
  houseNumber: String, // NEU
  latitude: Number,
  longitude: Number,
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
}, { timestamps: true });

module.exports = mongoose.model('Ad', adSchema);
