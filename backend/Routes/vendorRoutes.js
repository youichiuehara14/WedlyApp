const express = require('express');
const {
  createVendor,
  getVendorByBoard,
  updateVendor,
  deleteVendor,
} = require('../controllers/vendorController');

const router = express.Router();
const authenticateUser = require('../Middlewares/authenticateUser');

router.post('/create-vendor', authenticateUser, createVendor);
router.get('/:boardId', authenticateUser, getVendorByBoard);
router.put('/update-vendor/:vendorId', authenticateUser, updateVendor);
router.delete('/delete-vendor/:vendorId', authenticateUser, deleteVendor);

module.exports = router;
