const express = require('express');
const {
  registerUser,
  loginUser,
  forgotPassword,
  getProfile,
  logoutUser,
  updateUserInfo,
  getAllUsers,
  validateEmail,
} = require('../Controllers/userController');

const router = express.Router();
const authenticateUser = require('../Middlewares/authenticateUser');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);

router.get('/profile', authenticateUser, getProfile);
router.post('/logout', authenticateUser, logoutUser);
router.put('/update', authenticateUser, updateUserInfo);
router.get('/all', authenticateUser, getAllUsers);

router.post('/validate-email', validateEmail);

module.exports = router;
