const mongoose = require('mongoose');

// ⭐ Optional: Du kannst diesen Befehl temporär beim Start einfügen,
// um den alten `username`-Index zu löschen, falls vorhanden.
mongoose.connection.once('open', () => {
   mongoose.connection.db.collection('users').dropIndex('username_1').catch(() => {});
 });

const ratingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rating: { type: Number, min: 1, max: 5 }
}, { _id: false });

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName:  { type: String, required: true },
  email:     { type: String, required: true, unique: true },
  password:  { type: String, required: true },
  ratings:   [ratingSchema]
}, { timestamps: true });

userSchema.virtual('averageRating').get(function () {
  if (!this.ratings || this.ratings.length === 0) return 0;
  const sum = this.ratings.reduce((acc, r) => acc + r.rating, 0);
  return (sum / this.ratings.length).toFixed(1);
});

userSchema.set('toObject', { virtuals: true });
userSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('User', userSchema);
