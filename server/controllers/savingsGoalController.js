const SavingsAccount = require('../models/SavingsAccount');
const SavingsGoal = require('../models/SavingsGoal');
const Budget = require('../models/Budget');
const AppSettings = require('../models/AppSettings');
const Subcategory = require('../models/Subcategory');

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

    try {
      const goal = await SavingsGoal.findById(id);
      if (!goal) { return res.status(404).json({ message: 'Savings goal not found.' }); }

      const account = await SavingsAccount.findById(goal.account_id);
      if (!account) { return res.status(404).json({ message: 'Associated savings account not found.' }); }

      if (withdrawalAmount > goal.current_amount) {
          return res.status(400).json({ message: `Withdrawal amount cannot exceed the goal's current balance of ${new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(goal.current_amount)}` });
      }

      const parentCategory = await Subcategory.findParentCategory(subcategory_id);
      if (!parentCategory) { return res.status(404).json({ message: 'Parent category not found for the selected subcategory.' }); }

      const settings = await AppSettings.get();
      if (!settings) { throw new Error("App settings not found."); }

      const today = new Date();
      let year = today.getFullYear();
      let month = today.getMonth() + 1;

      if (today.getDate() >= settings.fiscal_day_start) {
        month += 1;
        if (month > 12) { month = 1; year += 1; }
      }

      const db = require('../config/database');
      const database = await db.openDb();
      await database.exec('BEGIN TRANSACTION');

      try {
        await SavingsAccount.updateBalance(goal.account_id, -withdrawalAmount);
        await SavingsGoal.updateBalance(goal.id, -withdrawalAmount);
        await Budget.addToBudget(year, month, parentCategory.category_id, withdrawalAmount);

        await database.exec('COMMIT');
        res.status(200).json({ message: 'Withdrawal successful. Budget has been updated.' });
      } catch (innerError) {
        await database.exec('ROLLBACK');
        throw innerError;
      }
    } catch (error) {
      console.error('Error during withdrawal:', error);
      res.status(500).json({ message: 'Server error during withdrawal.', error: error.message });
    }
  }
}

module.exports = SavingsController;