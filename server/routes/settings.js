const express = require('express');
const router = express.Router();
const SettingsController = require('../controllers/settingsController');
const isAuthenticated = require('../middleware/isAuthenticated');

router.use(isAuthenticated);

router.get('/', SettingsController.getSettings);
router.post('/', SettingsController.saveSettings);
router.post('/refresh-holidays', SettingsController.refreshHolidays);

module.exports = router;
