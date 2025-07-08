const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const { createFinancialMonthService } = require('../services/financialMonthService');

class DashboardController {
  static async getMonthlySummary(req, res) {
    try {
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth() + 1;

      const financialMonthService = await createFinancialMonthService();
      const { startDate, endDate } = financialMonthService.getFinancialMonthRange(year, month);

      const [
        monthlySummary,
        spendingByCategory,
        categoryBudgets
      ] = await Promise.all([
        Transaction.getSummaryByDateRange(startDate, endDate),
        Transaction.getSpendingByCategory(startDate, endDate),
        // CORRECTED: This now calls the correct function from the Budget model
        Budget.getCategoryBudgetsForMonth(year, month, startDate, endDate)
      ]);

      const categoryMap = new Map();

      categoryBudgets.forEach(b => {
        categoryMap.set(b.category_id, {
          category_name: b.category_name,
          budgeted: b.budgeted_amount,
          actual: 0
        });
      });

      spendingByCategory.forEach(s => {
        if (categoryMap.has(s.category_id)) {
          categoryMap.get(s.category_id).actual = s.actual_spending;
        } else {
          categoryMap.set(s.category_id, {
            category_name: s.category_name,
            budgeted: 0,
            actual: s.actual_spending
          });
        }
      });

      const budgetVsActual = Array.from(categoryMap.values());
      const surplus_deficit = monthlySummary.total_income - monthlySummary.total_spending;

      const dashboardData = {
        month_to_date_summary: {
          ...monthlySummary,
          surplus_deficit: Math.round(surplus_deficit * 100) / 100
        },
        budget_vs_actual: budgetVsActual
      };

      res.status(200).json(dashboardData);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      res.status(500).json({ message: 'Server error fetching dashboard data.' });
    }
  }
}

module.exports = DashboardController;
