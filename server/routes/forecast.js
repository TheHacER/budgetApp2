const express = require('express');
const router = express.Router();
const ForecastController = require('../controllers/forecastController');
const isAuthenticated = require('../middleware/isAuthenticated');

router.use(isAuthenticated);

router.get('/cashflow', ForecastController.getCashflowForecast);

module.exports = router;
