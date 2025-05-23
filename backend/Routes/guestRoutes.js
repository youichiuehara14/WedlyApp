const express = require('express');
const {
  createGuest,
  getGuestListPerUser,
  updateGuest,
  deleteGuest,
} = require('../Controllers/guestController');

const router = express.Router();
const authenticateUser = require('../Middlewares/authenticateUser');

router.post('/createGuest', authenticateUser, createGuest);
router.get('/getGuestList', authenticateUser, getGuestListPerUser);
router.put('/updateGuest/:guestId', authenticateUser, updateGuest);
router.delete('/deleteGuest/:guestId', authenticateUser, deleteGuest);

module.exports = router;
