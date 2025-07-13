const express = require('express');
const router = express.Router();
const SettingsController = require('../controllers/settingsController');
const isAuthenticated = require('../middleware/isAuthenticated');

// PUBLIC ROUTE: Check settings BEFORE login to see if setup is complete.
router.get('/', SettingsController.getSettings);

// PROTECTED ROUTES: You must be logged in to change settings.
router.post('/', isAuthenticated, SettingsController.saveSettings);
router.post('/refresh-holidays', isAuthenticated, SettingsController.refreshHolidays);

module.exports = router;