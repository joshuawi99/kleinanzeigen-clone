const mongoose = require('mongoose');

const adSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },

    zipCode: { type: String },
    location: { type: String },
    street: { type: String },
    houseNumber: { type: String },
    city: { type: String },

    latitude: { type: Number },
    longitude: { type: Number },

    image: { type: String }, // 🌇 einzelnes Hauptbild
    images: [String],        // 🖼️ optional: mehrere Bilder

    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Ad', adSchema);
