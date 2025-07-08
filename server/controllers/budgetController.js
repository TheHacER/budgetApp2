const Budget = require('../models/Budget');
const { createFinancialMonthService } = require('../services/financialMonthService');

class BudgetController {
  static async setBudgetsBulk(req, res) {
    const { budgets } = req.body;
    if (!budgets || !Array.isArray(budgets)) {
      return res.status(400).json({ message: 'Request must contain an array of budgets.' });
    }
    try {
      await Budget.bulkSet(budgets);
      res.status(200).json({ message: 'Budgets updated successfully.' });
    } catch (error) {
      console.error('Error setting budgets in bulk:', error);
      res.status(500).json({ message: 'Server error updating budgets.' });
    }
  }

  static async getBudgetsByMonth(req, res) {
    const year = parseInt(req.params.year, 10);
    const month = parseInt(req.params.month, 10);
    try {
      const financialMonthService = await createFinancialMonthService();
      const { startDate, endDate } = financialMonthService.getFinancialMonthRange(year, month);
      const budgets = await Budget.getCategoryBudgetsForMonth(year, month, startDate, endDate);
      res.status(200).json(budgets);
    } catch (error) {
      console.error('Error fetching budgets:', error);
      res.status(500).json({ message: 'Server error fetching budgets.' });
    }
  }
}

module.exports = BudgetController;
