const express = require('express');
const {
  createNewBoard,
  getBoardByUser,
  getBoardDetails,
  addMemberToBoard,
  removeMemberFromBoard,
  updateBoard,
  deleteBoard,
} = require('../Controllers/boardController');

const router = express.Router();
const authenticateUser = require('../Middlewares/authenticateUser');

router.post('/create-new-board', authenticateUser, createNewBoard);
router.get('/user/:userId', authenticateUser, getBoardByUser);
router.get('/:boardId', authenticateUser, getBoardDetails);

router.post(
  '/add-board-member/:boardId/members',
  authenticateUser,
  addMemberToBoard
);

router.delete(
  '/remove-board-member/:boardId/members/:memberId',
  authenticateUser,
  removeMemberFromBoard
);

router.put('/:id', authenticateUser, updateBoard);
router.delete('/:id', authenticateUser, deleteBoard);

module.exports = router;
