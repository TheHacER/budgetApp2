const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/dashboardController');
const isAuthenticated = require('../middleware/isAuthenticated');

router.use(isAuthenticated);

// This is the new, single endpoint for the rebuilt dashboard
router.get('/', DashboardController.getDashboardData);

module.exports = router;