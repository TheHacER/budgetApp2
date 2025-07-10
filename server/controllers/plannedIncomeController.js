const PlannedIncome = require('../models/PlannedIncome');

class PlannedIncomeController {
  static async createIncome(req, res) {
    try {
      const income = await PlannedIncome.create(req.body);
      res.status(201).json(income);
    } catch (error) {
      res.status(500).json({ message: 'Error creating planned income.', error: error.message });
    }
  }

  static async getActiveIncome(req, res) {
    try {
      const income = await PlannedIncome.findAllActive();
      res.status(200).json(income);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching planned income.', error: error.message });
    }
  }

  static async updateIncome(req, res) {
    try {
      const income = await PlannedIncome.update(req.params.id, req.body);
      res.status(200).json(income);
    } catch (error) {
      res.status(500).json({ message: 'Error updating planned income.', error: error.message });
    }
  }

  static async deactivateIncome(req, res) {
    try {
      await PlannedIncome.deactivate(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Error deactivating planned income.', error: error.message });
    }
  }
}

module.exports = PlannedIncomeController;