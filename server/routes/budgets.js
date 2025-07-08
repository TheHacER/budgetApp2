const express = require('express');
const router = express.Router();
const BudgetController = require('../controllers/budgetController');
const isAuthenticated = require('../middleware/isAuthenticated');

router.use(isAuthenticated);

router.post('/bulk', BudgetController.setBudgetsBulk);
router.get('/:year/:month', BudgetController.getBudgetsByMonth);

module.exports = router;
