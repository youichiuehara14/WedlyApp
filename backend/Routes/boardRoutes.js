const express = require('express');
const {
  createNewBoard,
  getBoardByUser,
  getBoardDetails,
  addMemberToBoard,
  removeMemberToBoard,
} = require('../Controllers/boardController');

const router = express.Router();
const authenticateUser = require('../Middlewares/authenticateUser');

router.post('/create-new-board', authenticateUser, createNewBoard);
router.get('/user/:userId', authenticateUser, getBoardByUser);
router.get('/:boardId', authenticateUser, getBoardDetails);
router.post('/add-board-member', authenticateUser, addMemberToBoard);
router.post('/remove-board-member', authenticateUser, removeMemberToBoard);

module.exports = router;
