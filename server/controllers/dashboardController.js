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
      // If setup is not complete, return empty data to prevent a crash.
      if (!financialMonthService) {
        return res.status(200).json({
          summary: { totalIncome: 0, totalSpending: 0, plannedSurplus: 0, currentSurplus: 0 },
          incomeStatus: [],
          inMonthCashflow: [],
          twelveMonthForecast: [],
          savingsGoals: [],
          budgetVsActual: [],
          topVendors: [],
        });
      }

      const { year, month, startDate, endDate } = financialMonthService.getCurrentFinancialMonth(); 
      
      const [
        allTransactions,
        allBudgets,
        allPlannedIncomes,
        allSavingsAccounts,
        twelveMonthForecast,
        topVendors,
        spendingByCategory
      ] = await Promise.all([
        Transaction.findAllByDateRange(startDate, endDate),
        Budget.getBudgetsBySubCategoryForMonth(year, month),
        PlannedIncome.findAllActive(),
        SavingsAccount.findAll(),
        ForecastService.generateForecast(),
        Transaction.getTopVendorsByTransactionCount(startDate, endDate),
        Transaction.getSpendingByCategory(startDate, endDate)
      ]);

      const totalIncome = allTransactions
        .filter(t => !t.is_debit && t.transaction_type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      // CORRECTED: Total spending is now debits minus refunds.
      const totalSpending = allTransactions.reduce((sum, t) => {
        if (t.is_debit) {
            return sum + t.amount;
        }
        if (!t.is_debit && t.transaction_type === 'refund') {
            return sum - t.amount;
        }
        return sum;
      }, 0);
      
      const plannedIncomeTotal = allPlannedIncomes.reduce((sum, i) => sum + i.amount, 0);
      const totalBudgeted = allBudgets.reduce((sum, b) => sum + b.budgeted_amount, 0);
      const plannedSurplus = plannedIncomeTotal - totalBudgeted;

      // CORRECTED: More robust matching for received income.
      const normalizeForMatch = (str) => str.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();

      const receivedIncomes = allPlannedIncomes.map(pi => {
        const normalizedSourceName = normalizeForMatch(pi.source_name);
        const received = allTransactions.some(t => {
            if (t.is_debit || t.transaction_type !== 'income') return false;
            const normalizedDesc = normalizeForMatch(t.description_original);
            return normalizedDesc.includes(normalizedSourceName);
        });
        return { ...pi, received };
      });

      const spendingMap = new Map();
      allTransactions.filter(t => t.is_debit).forEach(t => {
          if (t.subcategory_id) {
              spendingMap.set(t.subcategory_id, (spendingMap.get(t.subcategory_id) || 0) + t.amount);
          }
      });
      
      const budgetOverspends = allBudgets.reduce((acc, budget) => {
        const spendingForSubcategory = spendingMap.get(budget.subcategory_id) || 0;
        if (spendingForSubcategory > budget.budgeted_amount) {
            acc += (spendingForSubcategory - budget.budgeted_amount);
        }
        return acc;
      }, 0);

      const currentSurplus = totalIncome - totalSpending;
      
      const inMonthCashflow = [];
      let runningBalance = 0;
      const daysInMonth = (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24);
      let currentDate = new Date(startDate);

      for (let i = 0; i <= daysInMonth; i++) {
          const isoDate = currentDate.toISOString().split('T')[0];
          
          const dailyInflow = allTransactions.filter(t => !t.is_debit && t.transaction_date === isoDate).reduce((sum, t) => sum + t.amount, 0);
          const dailyOutflow = allTransactions.filter(t => t.is_debit && t.transaction_date === isoDate).reduce((sum, t) => sum + t.amount, 0);

          runningBalance += dailyInflow - dailyOutflow;
          inMonthCashflow.push({ date: isoDate, actual: runningBalance });
          currentDate.setDate(currentDate.getDate() + 1);
      }

      const categoryMap = new Map();
      allBudgets.forEach(b => {
          if (!categoryMap.has(b.category_id)) {
              categoryMap.set(b.category_id, { category_name: b.category_name, budgeted: 0, actual: 0 });
          }
          let categoryData = categoryMap.get(b.category_id);
          categoryData.budgeted += b.budgeted_amount;
      });

      spendingByCategory.forEach(s => {
          if (categoryMap.has(s.category_id)) {
              categoryMap.get(s.category_id).actual += s.actual_spending;
          } else {
              categoryMap.set(s.category_id, { category_name: s.category_name, budgeted: 0, actual: s.actual_spending });
          }
      });

      const dashboardData = {
        summary: {
            totalIncome,
            totalSpending,
            plannedSurplus,
            currentSurplus
        },
        incomeStatus: receivedIncomes,
        inMonthCashflow,
        twelveMonthForecast,
        savingsGoals: allSavingsAccounts.flatMap(acc => acc.goals),
        budgetVsActual: Array.from(categoryMap.values()),
        topVendors: topVendors,
      };

      res.status(200).json(dashboardData);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      res.status(500).json({ message: 'Server error fetching dashboard data.' });
    }
  }
}

module.exports = DashboardController;