const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/dashboardController');
const isAuthenticated = require('../middleware/isAuthenticated');

router.use(isAuthenticated);

router.get('/monthly-summary', DashboardController.getMonthlySummary);

module.exports = router;
