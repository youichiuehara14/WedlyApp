const mongoose = require('mongoose');

const boardSchema = new mongoose.Schema({
  name: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Users' }],
  totalBudget: { type: Number, required: true },
  totalSpent: { type: Number, default: 0 },
  totalRemaining: { type: Number, default: 0 },
  weddingDate: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Boards = mongoose.model('Boards', boardSchema);

module.exports = Boards;
