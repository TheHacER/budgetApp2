const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const Subcategory = require('../models/Subcategory');
const { createFinancialMonthService } = require('../services/financialMonthService');
const { parse } = require('csv-parse/sync');

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
      res.status(500).json({ message: 'Server error updating budgets.' });
    }
  }

  static async getBudgetsByMonth(req, res) {
    const year = parseInt(req.params.year, 10);
    const month = parseInt(req.params.month, 10);
    try {
      const financialMonthService = await createFinancialMonthService();
      const { startDate, endDate } = financialMonthService.getFinancialMonthRange(year, month);

      const [budgets, spending, recurringBills] = await Promise.all([
        Budget.getBudgetsBySubCategoryForMonth(year, month),
        Transaction.getSpendingBySubCategory(startDate, endDate),
        Transaction.getRecurringBillsTotalBySubCategory(endDate, startDate)
      ]);

      const spendingMap = new Map(spending.map(item => [item.subcategory_id, item.actual_spending]));
      const recurringMap = new Map(recurringBills.map(item => [item.subcategory_id, item.total_recurring]));

      const dataWithCarryover = await Promise.all(budgets.map(async (budget) => {
        const carryover = budget.budget_type === 'rolling' ? await Budget.getPreviousMonthSurplus(budget.subcategory_id, year, month) : 0;
        return {
          ...budget,
          actual_spending: spendingMap.get(budget.subcategory_id) || 0,
          recurring_bills_total: recurringMap.get(budget.subcategory_id) || 0,
          carryover_amount: carryover,
        };
      }));

      res.status(200).json(dataWithCarryover);
    } catch (error) {
      console.error('Error fetching budgets:', error);
      res.status(500).json({ message: 'Server error fetching budgets.' });
    }
  }

  static async getBudgetTemplate(req, res) {
    try {
        const subcategories = await Subcategory.findAllWithParent();
        let csvString = "subcategory_id,category_name,subcategory_name";
        
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();

        for (let i=0; i < 12; i++) {
            const d = new Date(year, month + i, 1);
            csvString += `,${d.toLocaleString('default', { month: 'short' })}-${d.getFullYear()}`;
        }
        csvString += "\n";

        for (const sc of subcategories) {
            csvString += `${sc.id},"${sc.category_name}","${sc.name}"` + ",0.00".repeat(12) + "\n";
        }

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="budget_template_forward_12m.csv"`);
        res.status(200).send(csvString);
    } catch (error) {
        res.status(500).json({ message: 'Server error generating budget template.' });
    }
  }

  static async uploadBudget(req, res) {
    if (!req.file) { return res.status(400).json({ message: 'No file uploaded.' }); }
    try {
        const records = parse(req.file.buffer, {
            columns: true,
            skip_empty_lines: true,
            trim: true,
        });

        const budgetsToSave = [];
        const today = new Date();

        for(const rec of records) {
            for(let i=0; i < 12; i++) {
                const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
                const year = d.getFullYear();
                const month = d.getMonth() + 1;
                const monthShort = d.toLocaleString('default', { month: 'short' });
                const header = `${monthShort}-${year}`;
                
                if (rec[header]) {
                    budgetsToSave.push({
                        subcategory_id: parseInt(rec.subcategory_id, 10),
                        year: year,
                        month: month,
                        amount: parseFloat(rec[header] || 0),
                        budget_type: 'allowance' // Default, can be changed in UI
                    });
                }
            }
        }

        if (budgetsToSave.some(b => isNaN(b.subcategory_id) || isNaN(b.year) || isNaN(b.month) || isNaN(b.amount))) {
            return res.status(400).json({ message: 'CSV contains invalid or malformed data.' });
        }

        await Budget.bulkSet(budgetsToSave);
        res.status(200).json({ message: `Successfully uploaded and saved ${budgetsToSave.length} budget entries.` });
    } catch (error) {
        res.status(500).json({ message: `Error processing CSV file: ${error.message}` });
    }
  }
}

module.exports = BudgetController;