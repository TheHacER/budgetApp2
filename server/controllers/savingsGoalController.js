const SavingsAccount = require('../models/SavingsAccount');
const SavingsGoal = require('../models/SavingsGoal');
const Budget = require('../models/Budget');
const { createFinancialMonthService } = require('../services/financialMonthService');

class SavingsController {
  static async createSavingsAccount(req, res) {
    try {
      const account = await SavingsAccount.create(req.body);
      res.status(201).json(account);
    } catch (error) {
      res.status(500).json({ message: 'Error creating savings account.', error: error.message });
    }
  }

  static async getAllSavingsAccounts(req, res) {
    try {
      const accounts = await SavingsAccount.findAll();
      res.status(200).json(accounts);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching savings accounts.', error: error.message });
    }
  }

  static async updateSavingsAccount(req, res) {
    try {
      const account = await SavingsAccount.update(req.params.id, req.body);
      res.status(200).json(account);
    } catch (error) {
      res.status(500).json({ message: 'Error updating savings account.', error: error.message });
    }
  }

  static async deleteSavingsAccount(req, res) {
    try {
      await SavingsAccount.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Error deleting savings account.', error: error.message });
    }
  }

  static async createSavingsGoal(req, res) {
    try {
      const goal = await SavingsGoal.create(req.body);
      res.status(201).json(goal);
    } catch (error) {
      res.status(500).json({ message: 'Error creating savings goal.', error: error.message });
    }
  }

  static async updateSavingsGoal(req, res) {
    try {
      const goal = await SavingsGoal.update(req.params.id, req.body);
      res.status(200).json(goal);
    } catch (error) {
      res.status(500).json({ message: 'Error updating savings goal.', error: error.message });
    }
  }

  static async deleteSavingsGoal(req, res) {
    try {
      await SavingsGoal.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Error deleting savings goal.', error: error.message });
    }
  }

  static async withdrawFromGoal(req, res) {
    const { id } = req.params;
    const { amount, subcategory_id } = req.body;

    const withdrawalAmount = parseFloat(amount);
    if (!withdrawalAmount || !subcategory_id) {
      return res.status(400).json({ message: 'Withdrawal amount and subcategory are required.' });
    }

    if (withdrawalAmount <= 0) {
      return res.status(400).json({ message: 'Withdrawal amount must be a positive number.' });
    }
    
    const db = require('../config/database');
    const database = await db.openDb();

    try {
      await database.exec('BEGIN TRANSACTION');

      const goal = await SavingsGoal.findById(id, database);
      if (!goal) { throw new Error('Savings goal not found.'); }
      
      if (withdrawalAmount > goal.current_amount) {
          throw new Error(`Withdrawal amount cannot exceed the goal balance of ${new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(goal.current_amount)}`);
      }

      const financialMonthService = await createFinancialMonthService();
      const { year, month } = financialMonthService.getCurrentFinancialMonth();
      
      const existingBudget = await Budget.getSingleBudget(subcategory_id, year, month, database);
      
      const newBudgetAmount = (existingBudget ? existingBudget.amount : 0) + withdrawalAmount;
      const budgetPayload = {
          subcategory_id: subcategory_id,
          year: year,
          month: month,
          amount: newBudgetAmount,
          budget_type: existingBudget ? existingBudget.budget_type : 'allowance'
      };

      await Budget.bulkSet([budgetPayload], database);
      await SavingsGoal.updateBalance(id, -withdrawalAmount, database);
      await SavingsAccount.updateBalance(goal.account_id, -withdrawalAmount, database);
      
      await database.exec('COMMIT');
      res.status(200).json({ message: 'Withdrawal successful. Budget has been updated.' });

    } catch (error) {
      await database.exec('ROLLBACK');
      console.error('Error during withdrawal:', error);
      res.status(500).json({ message: error.message || 'Server error during withdrawal.' });
    }
  }
}

module.exports = SavingsController;