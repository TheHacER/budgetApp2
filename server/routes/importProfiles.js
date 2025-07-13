const express = require('express');
const router = express.Router();
const ImportProfileController = require('../controllers/importProfileController');
const isAuthenticated = require('../middleware/isAuthenticated');

router.use(isAuthenticated);

router.get('/', ImportProfileController.getAllProfiles);
router.post('/', ImportProfileController.createProfile);
router.put('/:id', ImportProfileController.updateProfile);
router.delete('/:id', ImportProfileController.deleteProfile);

module.exports = router;