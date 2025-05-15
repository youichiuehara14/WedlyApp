const express = require('express');
const {
  addComment,
  editComment,
  deleteComment,
  getComments,
} = require('../Controllers/commentController');

const router = express.Router();
const authenticateUser = require('../Middlewares/authenticateUser');

router.post('/add-comment/:taskId', authenticateUser, addComment);
router.put('/edit-comment/:taskId/:commentId', authenticateUser, editComment);
router.delete(
  '/delete-comment/:taskId/:commentId',
  authenticateUser,
  deleteComment
);
router.get('/get-comment/:taskId', authenticateUser, getComments);

module.exports = router;
