const express = require('express');
const {
  createTask,
  getTasksByBoard,
  updateTask,
  deleteTask,
} = require('../Controllers/taskController');
const router = express.Router();
const authenticateUser = require('../Middlewares/authenticateUser');

router.post('/create-task', authenticateUser, createTask);
router.get('/board/:boardId', authenticateUser, getTasksByBoard);
router.put('/update-task/:taskId', authenticateUser, updateTask);
router.delete('/delete-task/:taskId', authenticateUser, deleteTask);

module.exports = router;
