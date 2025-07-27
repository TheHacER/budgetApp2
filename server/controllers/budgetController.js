const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const Subcategory = require('../models/Subcategory');
const Category = require('../models/Category'); // Import Category model
const { createFinancialMonthService } = require('../services/financialMonthService');
const { parse } = require('csv-parse/sync');
const db = require('../config/database');


async function getPreviousMonthSurplus(subcategoryId, year, month) {
    const dbInstance = await db.openDb();
    const financialMonthService = await createFinancialMonthService();
    if (!financialMonthService) return 0;

    const previousMonthDate = new Date(year, month - 2, 1);
    const prevYear = previousMonthDate.getFullYear();
    const prevMonth = previousMonthDate.getMonth() + 1;

    const { startDate, endDate } = financialMonthService.getFinancialMonthRange(prevYear, prevMonth);

    const prevMonthBudget = await Budget.getSingleBudget(subcategoryId, prevYear, prevMonth, dbInstance);
    if (!prevMonthBudget || prevMonthBudget.budget_type !== 'rolling') {
        return 0;
    }

    const spendingSql = `
      SELECT COALESCE(SUM(amount), 0) as total
      FROM (
        SELECT amount FROM transactions
        WHERE subcategory_id = ? AND transaction_date BETWEEN ? AND ? AND is_debit = 1 AND is_split = 0
        UNION ALL
        SELECT st.amount FROM split_transactions st
        JOIN transactions t ON st.transaction_id = t.id
        WHERE st.subcategory_id = ? AND t.transaction_date BETWEEN ? AND ? AND t.is_debit = 1
      )
    `;
    const result = await dbInstance.get(spendingSql, [subcategoryId, startDate, endDate, subcategoryId, startDate, endDate]);
    const prevMonthSpending = result.total || 0;

    return (prevMonthBudget.amount || 0) - prevMonthSpending;
}

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
            if (!financialMonthService) {
                return res.status(400).json({ message: "Financial month service not available. Check if initial setup is complete." })
            }
            const { startDate, endDate } = financialMonthService.getFinancialMonthRange(year, month);

            const [budgets, spending, recurringBills] = await Promise.all([
                Budget.getBudgetsBySubCategoryForMonth(year, month),
                Transaction.getSpendingBySubCategory(startDate, endDate),
                Transaction.getRecurringBillsTotalBySubCategory(endDate, startDate)
            ]);

            const spendingMap = new Map(spending.map(item => [item.subcategory_id, item.actual_spending]));
            const recurringMap = new Map(recurringBills.map(item => [item.subcategory_id, item.total_recurring]));

            const dataWithCarryover = await Promise.all(budgets.map(async (budget) => {
                const carryover = budget.budget_type === 'rolling' ? await getPreviousMonthSurplus(budget.subcategory_id, year, month) : 0;
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
            let csvString = "Category,Subcategory"; // Corrected headers

            const today = new Date();
            for (let i = 0; i < 12; i++) {
                const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
                // Format to 'Mon YY' e.g., 'Jul 25'
                const header = `${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear().toString().slice(-2)}`;
                csvString += `,${header}`;
            }
            csvString += "\n";

            for (const sc of subcategories) {
                csvString += `"${sc.category_name}","${sc.name}"` + ",0.00".repeat(12) + "\n";
            }

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="budget_template_forward_12m.csv"`);
            res.status(200).send(csvString);
        } catch (error) {
            console.error('Error generating budget template:', error);
            res.status(500).json({ message: 'Server error generating budget template.' });
        }
    }

    static async uploadBudget(req, res) {
        if (!req.file) { return res.status(400).json({ message: 'No file uploaded.' }); }
        const dbInstance = await db.openDb();

        try {
            const records = parse(req.file.buffer, {
                columns: true,
                skip_empty_lines: true,
                trim: true,
            });

            const budgetsToSave = [];
            let newCategories = 0;
            let newSubcategories = 0;

            for (const rec of records) {
                const categoryName = rec.Category;
                const subcategoryName = rec.Subcategory;

                if (!categoryName || !subcategoryName) continue;

                // Find or Create Category
                let category = await dbInstance.get('SELECT id FROM categories WHERE name = ?', [categoryName]);
                if (!category) {
                    const newCat = await Category.create(categoryName);
                    category = { id: newCat.id };
                    newCategories++;
                }

                // Find or Create Subcategory
                let subcategory = await dbInstance.get('SELECT id FROM subcategories WHERE name = ? AND category_id = ?', [subcategoryName, category.id]);
                if (!subcategory) {
                    const newSubcat = await Subcategory.create(subcategoryName, category.id);
                    subcategory = { id: newSubcat.id };
                    newSubcategories++;
                }

                // Process budget entries for the row
                for (const header in rec) {
                    if (header.toLowerCase() !== 'category' && header.toLowerCase() !== 'subcategory') {
                        // Allow either "Jul 25" or "Jul-25" style headers
                        const dateParts = header.match(/([a-zA-Z]+)[-\s]*(\d+)/);
                        if (dateParts && dateParts.length === 3) {
                            const monthStr = dateParts[1];
                            let yearNum = parseInt(dateParts[2], 10);
                            if (yearNum < 100) {
                                yearNum += 2000;
                            }
                            const monthNum = new Date(Date.parse(monthStr + " 1, 2000")).getMonth() + 1;

                            const amount = parseFloat(rec[header] || 0);

                            if (!isNaN(monthNum) && !isNaN(yearNum) && !isNaN(amount)) {
                                budgetsToSave.push({
                                    subcategory_id: subcategory.id,
                                    year: yearNum,
                                    month: monthNum,
                                    amount: amount,
                                    budget_type: 'allowance' // Default as per doc
                                });
                            }
                        }
                    }
                }
            }

            if (budgetsToSave.length > 0) {
                await Budget.bulkSet(budgetsToSave, dbInstance);
            }

            res.status(200).json({ message: `Successfully uploaded ${budgetsToSave.length} budget entries. Created ${newCategories} new categories and ${newSubcategories} new subcategories.` });

        } catch (error) {
            console.error('Error processing budget CSV:', error);
            res.status(500).json({ message: `Error processing CSV file: ${error.message}` });
        }
    }
}

module.exports = BudgetController;