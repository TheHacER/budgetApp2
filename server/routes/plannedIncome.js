const express = require('express');
const router = express.Router();
const PlannedIncomeController = require('../controllers/plannedIncomeController');
const isAuthenticated = require('../middleware/isAuthenticated');

router.use(isAuthenticated);

router.post('/', PlannedIncomeController.createIncome);
router.get('/', PlannedIncomeController.getActiveIncome);
router.put('/:id', PlannedIncomeController.updateIncome);
router.delete('/:id', PlannedIncomeController.deactivateIncome);

module.exports = router;