const express = require('express');
const {
  createVendor,
  getVendorListPerUser,
  updateVendor,
  deleteVendor,
} = require('../Controllers/vendorController');

const router = express.Router();
const authenticateUser = require('../Middlewares/authenticateUser');

router.post('/create-vendor', authenticateUser, createVendor);
router.get('/vendorsPerUser', authenticateUser, getVendorListPerUser);
router.put('/update-vendor/:vendorId', authenticateUser, updateVendor);
router.delete('/delete-vendor/:vendorId', authenticateUser, deleteVendor);

module.exports = router;
