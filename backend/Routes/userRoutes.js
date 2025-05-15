const express = require('express');
const {
  registerUser,
  loginUser,
  forgotPassword,
  getProfile,
  logoutUser,
  updateUserInfo,
} = require('../Controllers/userController');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.get('/profile', getProfile);
router.post('/logout', logoutUser);
router.put('/update', updateUserInfo);

module.exports = router;
