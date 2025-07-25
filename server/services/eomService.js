const db = require('../config/database');
const { createFinancialMonthService } = require('./financialMonthService');
const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const SavingsGoal = require('../models/SavingsGoal');
const SavingsAccount = require('../models/SavingsAccount');

class EomService {
    static async runEomProcess(year, month) {
        const dbInstance = await db.openDb();
        await dbInstance.exec('BEGIN TRANSACTION');
        try {
            const financialMonthService = await createFinancialMonthService();
            const { startDate, endDate } = financialMonthService.getFinancialMonthRange(year, month);

            // Step 1: Verify 100% categorization (conceptual - for now, we assume it's done)
            // In a future version, we would add a check here and throw an error if not complete.
            
            // Step 2 & 3: Lock month and calculate surplus
            const budgets = await Budget.getBudgetsBySubCategoryForMonth(year, month);
            const spending = await Transaction.getSpendingBySubCategory(startDate, endDate);
            const spendingMap = new Map(spending.map(s => [s.subcategory_id, s.actual_spending]));

            let totalAllowanceSurplus = 0;
            let totalRollingSurplusToSave = 0; // Assuming a UI will handle this choice later

            for (const budget of budgets) {
                const actualSpend = spendingMap.get(budget.subcategory_id) || 0;
                const surplus = budget.budgeted_amount - actualSpend;

                if (budget.budget_type === 'allowance' && surplus > 0) {
                    totalAllowanceSurplus += surplus;
                }
                
                // This logic will be expanded when the UI for opting-in rolling surplus exists.
                // For now, only allowance surplus is automatically moved.

                // Write to history table to "lock" the month
                await dbInstance.run(
                    `INSERT INTO monthly_history (year, month, subcategory_id, budgeted_amount, actual_spend, budget_type, final_surplus_or_rollover)
                     VALUES (?, ?, ?, ?, ?, ?, ?)
                     ON CONFLICT(year, month, subcategory_id) DO NOTHING;`,
                    [year, month, budget.subcategory_id, budget.budgeted_amount, actualSpend, budget.budget_type, surplus]
                );
            }

            const surplusToDistribute = totalAllowanceSurplus + totalRollingSurplusToSave;
            if (surplusToDistribute <= 0) {
                await dbInstance.exec('COMMIT');
                return { message: "End of Month process complete. No surplus to distribute.", allocations: [] };
            }

            // Step 4: Distribute surplus to savings goals
            const allAccounts = await SavingsAccount.findAll();
            let activeGoals = allAccounts.flatMap(acc => acc.goals).filter(g => g.is_active);

            const currentDate = new Date();
            const priorityOrder = { high: 1, medium: 2, low: 3 };

            activeGoals = activeGoals.map(goal => {
                const targetDate = new Date(goal.target_date);
                const monthsRemaining = (targetDate.getFullYear() - currentDate.getFullYear()) * 12 + (targetDate.getMonth() - currentDate.getMonth());
                const amountNeeded = goal.target_amount - goal.current_amount;
                
                return {
                    ...goal,
                    priority_rank: targetDate < currentDate ? 0 : priorityOrder[goal.priority],
                    months_remaining: Math.max(1, monthsRemaining),
                    amount_needed: amountNeeded,
                    required_monthly: amountNeeded / Math.max(1, monthsRemaining)
                };
            }).filter(g => g.amount_needed > 0);

            activeGoals.sort((a, b) => {
                if (a.priority_rank !== b.priority_rank) {
                    return a.priority_rank - b.priority_rank;
                }
                return a.months_remaining - b.months_remaining;
            });
            
            let remainingSurplus = surplusToDistribute;
            const allocations = [];

            for (const goal of activeGoals) {
                if (remainingSurplus <= 0) break;
                
                const contribution = Math.min(remainingSurplus, goal.required_monthly);
                await SavingsGoal.updateBalance(goal.id, contribution, dbInstance);
                
                // Find the parent account and update its balance
                const parentAccount = allAccounts.find(acc => acc.id === goal.account_id);
                if(parentAccount) {
                    await SavingsAccount.updateBalance(parentAccount.id, contribution, dbInstance);
                }

                remainingSurplus -= contribution;
                allocations.push({ goal: goal.title, allocated: contribution });
            }

            if (remainingSurplus > 0) {
                // For now, any leftover surplus goes to the first savings account.
                // A more robust solution would be a designated "General Savings" pot.
                const generalSavings = allAccounts[0];
                if (generalSavings) {
                    await SavingsAccount.updateBalance(generalSavings.id, remainingSurplus, dbInstance);
                    allocations.push({ goal: 'General Savings', allocated: remainingSurplus });
                }
            }
            
            await dbInstance.exec('COMMIT');
            return { message: `End of Month process complete. Distributed ${formatCurrency(surplusToDistribute)}.`, allocations };

        } catch (error) {
            await dbInstance.exec('ROLLBACK');
            console.error("EOM Service Error:", error);
            throw new Error("Failed to complete End of Month process.");
        }
    }
}

const formatCurrency = (value) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(value || 0);

module.exports = EomService;