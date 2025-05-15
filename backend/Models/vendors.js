const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  board: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Boards',
    required: true,
  },
  name: { type: String, required: true },
  category: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  cost: { type: Number, required: true },
  email: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Vendors = mongoose.model('Vendors', vendorSchema);

module.exports = Vendors;
