const RecurringBill = require('../models/RecurringBill');

class RecurringBillController {
  static async createBill(req, res) {
    const { vendor_id, subcategory_id, amount, day_of_month, start_date } = req.body;
    if (!vendor_id || !subcategory_id || !amount || !day_of_month || !start_date) {
      return res.status(400).json({ message: 'Missing required fields for recurring bill.' });
    }
    try {
      const newBill = await RecurringBill.create(req.body);
      res.status(201).json(newBill);
    } catch (error) {
      console.error('Error creating recurring bill:', error);
      res.status(500).json({ message: 'Server error creating recurring bill.' });
    }
  }

  static async getActiveBills(req, res) {
    try {
      const bills = await RecurringBill.findAllActive();
      res.status(200).json(bills);
    } catch (error) {
      console.error('Error fetching recurring bills:', error);
      res.status(500).json({ message: 'Server error fetching recurring bills.' });
    }
  }

  static async updateBill(req, res) {
    const { id } = req.params;
    const newBillDetails = req.body;
    try {
      // The original code was calling a non-existent function "updateAndSupersede".
      // This has been corrected to call the standard "update" function.
      await RecurringBill.update(id, newBillDetails);
      const updatedBill = { id, ...newBillDetails };
      res.status(200).json(updatedBill);
    } catch (error) {
      console.error('Error updating recurring bill:', error);
      res.status(500).json({ message: 'Server error updating recurring bill.' });
    }
  }

  static async deactivateBill(req, res) {
    const { id } = req.params;
    try {
      const changes = await RecurringBill.deactivate(id);
      if (changes === 0) {
        return res.status(404).json({ message: 'Recurring bill not found.' });
      }
      res.status(200).json({ message: 'Recurring bill deactivated successfully.' });
    } catch (error) {
      console.error('Error deactivating recurring bill:', error);
      res.status(500).json({ message: 'Server error deactivating recurring bill.' });
    }
  }
}

module.exports = RecurringBillController;