const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  date: { type: Date, required: true },
  passengers: { type: Number, required: true, min: 1 },
}, {
  timestamps: true
});

module.exports = mongoose.model('Trip', tripSchema);
