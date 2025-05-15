const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  board: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Boards',
    required: true,
  },
  taskColor: {
    type: String,
    enum: ['red', 'orange', 'yellow', 'green', 'blue', 'purple'],
    default: 'red',
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: {
    type: String,
    enum: ['To Do', 'In Progress', 'Done'],
    default: 'To Do',
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium',
  },
  dueDate: { type: Date },
  position: { type: Number }, // for drag and drop
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendors',
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  cost: {
    type: Number,
    required: true,
  },
  checklists: [
    {
      text: { type: String, required: true },
      isCompleted: { type: Boolean, default: false },
    },
  ],
  comments: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
      text: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now },
    },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Tasks = mongoose.model('Tasks', taskSchema);

module.exports = Tasks;
