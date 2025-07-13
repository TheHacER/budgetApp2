const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const PlannedIncome = require('../models/PlannedIncome');
const SavingsAccount = require('../models/SavingsAccount');
const { createFinancialMonthService } = require('../services/financialMonthService');
const ForecastService = require('../services/forecastService');

class DashboardController {
  static async getDashboardData(req, res) {
    try {
      const financialMonthService = await createFinancialMonthService();
      // This will get the range for the current financial month
      const { year, month, startDate, endDate } = financialMonthService.getCurrentFinancialMonth(); 
      
      const [
        allTransactions,
        allBudgets,
        allPlannedIncomes,
        allSavingsAccounts,
        twelveMonthForecast
      ] = await Promise.all([
        Transaction.findAllByDateRange(startDate, endDate),
        Budget.getBudgetsBySubCategoryForMonth(year, month),
        PlannedIncome.findAllActive(),
        SavingsAccount.findAll(),
        ForecastService.generateForecast()
      ]);

      // --- Calculations ---
      const totalIncome = allTransactions.filter(t => !t.is_debit).reduce((sum, t) => sum + t.amount, 0);
      const totalSpending = allTransactions.filter(t => t.is_debit).reduce((sum, t) => sum + t.amount, 0);
      
      const plannedIncomeTotal = allPlannedIncomes.reduce((sum, i) => sum + i.amount, 0);
      const totalBudgeted = allBudgets.reduce((sum, b) => sum + b.budgeted_amount, 0);
      const plannedSurplus = plannedIncomeTotal - totalBudgeted;

      const receivedIncomes = allPlannedIncomes.map(pi => {
        const received = allTransactions.some(t => !t.is_debit && t.description_original.toLowerCase().includes(pi.source_name.toLowerCase()));
        return { ...pi, received };
      });

      const budgetOverspends = allBudgets.reduce((acc, budget) => {
        const spendingForSubcategory = allTransactions
            .filter(t => t.is_debit && t.subcategory_id === budget.subcategory_id)
            .reduce((sum, t) => sum + t.amount, 0);
        
        if (spendingForSubcategory > budget.budgeted_amount) {
            acc += (spendingForSubcategory - budget.budgeted_amount);
        }
        return acc;
      }, 0);

      const currentSurplus = plannedSurplus - budgetOverspends;
      
      // In-Month Cashflow
      const inMonthCashflow = [];
      let runningBalance = 0;
      const daysInMonth = new Date(year, month, 0).getDate();

      for (let day = 1; day <= daysInMonth; day++) {
          const date = new Date(year, month - 1, day);
          const isoDate = date.toISOString().split('T')[0];
          
          const dailyInflow = allTransactions.filter(t => !t.is_debit && t.transaction_date === isoDate).reduce((sum, t) => sum + t.amount, 0);
          const dailyOutflow = allTransactions.filter(t => t.is_debit && t.transaction_date === isoDate).reduce((sum, t) => sum + t.amount, 0);

          runningBalance += dailyInflow - dailyOutflow;
          inMonthCashflow.push({ date: isoDate, actual: runningBalance });
      }

      const dashboardData = {
        income: {
            total: totalIncome,
            breakdown: receivedIncomes,
        },
        budget: {
            total: totalBudgeted
        },
        surplus: {
            planned: plannedSurplus,
            current: currentSurplus
        },
        inMonthCashflow,
        twelveMonthForecast,
        savingsGoals: allSavingsAccounts.flatMap(acc => acc.goals)
      };

      res.status(200).json(dashboardData);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      res.status(500).json({ message: 'Server error fetching dashboard data.' });
    }
  }
}

module.exports = DashboardController;