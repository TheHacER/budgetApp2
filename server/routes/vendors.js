const express = require('express');
const router = express.Router();
const VendorController = require('../controllers/vendorController');
const isAuthenticated = require('../middleware/isAuthenticated');

router.use(isAuthenticated);

router.post('/', VendorController.createVendor);
router.get('/', VendorController.getAllVendors);
router.put('/:id', VendorController.updateVendor);
router.delete('/:id', VendorController.deleteVendor);

module.exports = router;
