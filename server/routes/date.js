const express = require('express');
const router = express.Router();
const dateController = require('../controllers/dateController');

router.get('/financial-year', dateController.getFinancialYear);
router.post('/financial-year', dateController.setFinancialYear);
router.get('/financial-months', dateController.getFinancialMonths);

// NEW ROUTE FOR HOLIDAY REFRESH
router.post('/refresh-holidays', dateController.refreshHolidays);

module.exports = router;