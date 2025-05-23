const mongoose = require('mongoose');

const guestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true,
  },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  rsvp: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Guest = mongoose.model('Guest', guestSchema);

module.exports = Guest;
