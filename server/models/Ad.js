const mongoose = require('mongoose');

const adSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  image: String,
  category: String,
  zipCode: String,
  location: String,
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }, // <-- Wichtig
}, { timestamps: true });

module.exports = mongoose.model('Ad', adSchema);
