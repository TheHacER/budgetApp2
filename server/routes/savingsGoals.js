const express = require('express');
const router = express.Router();
const SavingsController = require('../controllers/savingsGoalController');
const isAuthenticated = require('../middleware/isAuthenticated');

router.use(isAuthenticated);

// Savings Accounts
router.post('/accounts', SavingsController.createSavingsAccount);
router.get('/accounts', SavingsController.getAllSavingsAccounts);
router.put('/accounts/:id', SavingsController.updateSavingsAccount);
router.delete('/accounts/:id', SavingsController.deleteSavingsAccount);

// Savings Goals
router.post('/goals', SavingsController.createSavingsGoal);
router.put('/goals/:id', SavingsController.updateSavingsGoal);
router.delete('/goals/:id', SavingsController.deleteSavingsGoal);
router.post('/goals/:id/withdraw', SavingsController.withdrawFromGoal);

module.exports = router;