const CsvParserService = require('../services/csvParserService');
const VendorNormalizationService = require('../services/vendorNormalizationService');
const Transaction = require('../models/Transaction');
const IgnoredTransaction = require('../models/IgnoredTransaction');
const CategorizationRule = require('../models/CategorizationRule');
const SplitTransaction = require('../models/SplitTransaction');
const db = require('../config/database');


class TransactionController {
  static async uploadTransactions(req, res) {
    if (!req.file) { return res.status(400).json({ message: 'No file uploaded.' }); }
    
    try {
      const { profileId } = req.body;
      if(!profileId) { return res.status(400).json({ message: 'No import profile selected.' }); }

      const parsedTransactions = await CsvParserService.parse(req.file.buffer, profileId);
      
      const formattedTransactions = [];
      for(const tx of parsedTransactions) {
        const vendorId = await VendorNormalizationService.normalize(tx.description);
        let subcategoryId = null;
        if (vendorId) {
            const rule = await CategorizationRule.findRuleByVendor(vendorId);
            if (rule) { subcategoryId = rule.subcategory_id; }
        }

        formattedTransactions.push({
          transaction_date: tx.date,
          description_original: tx.description,
          amount: Math.abs(tx.amount),
          is_debit: tx.amount < 0,
          source_account: tx.source,
          vendor_id: vendorId,
          subcategory_id: subcategoryId,
        });
      }

      const validTransactions = formattedTransactions.filter(tx => tx.transaction_date && tx.amount > 0);
      let newCount = 0;
      let ignoredCount = 0;

      for (const tx of validTransactions) {
        const isDuplicate = await Transaction.exists(tx);
        if (!isDuplicate) { 
          await Transaction.create(tx);
          newCount++;
        } else {
          await IgnoredTransaction.create(tx, 'Potential Duplicate');
          ignoredCount++;
        }
      }

      res.status(201).json({ message: `Successfully saved ${newCount} new transactions. Ignored ${ignoredCount} duplicates.` });
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: error.message || 'Error processing file.' });
    }
  }

  static async applyRules(req, res) {
    try {
        const changes = await Transaction.applyCategorizationRules();
        res.status(200).json({ message: `Successfully categorized ${changes} transactions based on your existing rules.` });
    } catch (error) {
        console.error("Error applying categorization rules:", error);
        res.status(500).json({ message: 'Server error applying categorization rules.' });
    }
  }
  
  static async getIgnoredTransactions(req, res) {
    try {
      const transactions = await IgnoredTransaction.findAll();
      res.status(200).json(transactions);
    } catch (error) {
      res.status(500).json({ message: 'Server error fetching ignored transactions.' });
    }
  }

  static async reinstateTransaction(req, res) {
    try {
      const ignoredTx = await IgnoredTransaction.findById(req.params.id);
      if (!ignoredTx) {
        return res.status(404).json({ message: 'Ignored transaction not found.' });
      }

      const { id, reason, created_at, ...txToCreate } = ignoredTx;
      await Transaction.create(txToCreate);
      await IgnoredTransaction.delete(req.params.id);
      res.status(200).json({ message: 'Transaction reinstated.' });
    } catch (error) {
      res.status(500).json({ message: 'Error reinstating transaction.' });
    }
  }

  static async purgeIgnoredTransactions(req, res) {
    try {
      await IgnoredTransaction.deleteAll();
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Error purging ignored transactions.' });
    }
  }

  static async getAllTransactions(req, res) {
    try {
      const transactions = await Transaction.findAll();
      res.status(200).json(transactions);
    } catch (error) { res.status(500).json({ message: 'Server error fetching transactions.' }); }
  }

  static async getUncategorizedTransactions(req, res) {
    try {
      const transactions = await Transaction.findUncategorized();
      res.status(200).json(transactions);
    } catch (error) { res.status(500).json({ message: 'Server error fetching uncategorized transactions.' }); }
  }

  static async categorizeTransaction(req, res) {
    const { id } = req.params;
    const { subcategory_id, transaction_type, vendor_id } = req.body;
    const dbInstance = await db.openDb();

    try {
      await dbInstance.exec('BEGIN TRANSACTION');

      if (vendor_id) {
          await Transaction.updateVendor(id, vendor_id, dbInstance);
      }

      if (subcategory_id !== undefined && subcategory_id !== null) {
        await Transaction.updateCategory(id, subcategory_id, dbInstance);
      }
      
      if (transaction_type) {
        await Transaction.updateType(id, transaction_type, dbInstance);
      }

      const transaction = await Transaction.findById(id, dbInstance);
      const finalVendorId = transaction.vendor_id;
      
      if (finalVendorId && subcategory_id) {
          await CategorizationRule.createOrUpdateRule(finalVendorId, subcategory_id, dbInstance);
      }

      await dbInstance.exec('COMMIT');
      res.status(200).json({ message: 'Transaction updated successfully.' });
    } catch (error) {
      await dbInstance.exec('ROLLBACK');
      console.error("Error categorizing transaction:", error);
      res.status(500).json({ message: 'Server error categorizing transaction.' });
    }
  }

  static async updateTransactionVendor(req, res) {
    const { id } = req.params;
    const { vendor_id } = req.body;
    if (!vendor_id) { return res.status(400).json({ message: 'Vendor ID is required.' }); }
    try {
      const changes = await Transaction.updateVendor(id, vendor_id);
      if (changes === 0) { return res.status(404).json({ message: 'Transaction not found.' }); }
      res.status(200).json({ message: 'Transaction vendor updated successfully.' });
    } catch (error) { res.status(500).json({ message: 'Server error updating transaction vendor.' }); }
  }

  static async splitTransaction(req, res) {
    const { id } = req.params;
    const { splits, vendor_id } = req.body;

    if (!splits || !Array.isArray(splits) || splits.length < 2) { 
      return res.status(400).json({ message: 'A split must contain at least two items.' }); 
    }

    const database = await db.openDb();
    try {
      await database.exec('BEGIN TRANSACTION');
      const parentTx = await Transaction.findById(id, database);
      if (!parentTx) { throw new Error('Parent transaction not found.'); }
      
      const totalSplitAmount = splits.reduce((sum, s) => sum + parseFloat(s.amount || 0), 0);
      if (Math.abs(totalSplitAmount - parentTx.amount) > 0.01) { throw new Error(`Split amounts (£${totalSplitAmount.toFixed(2)}) do not match the parent transaction amount (£${parentTx.amount.toFixed(2)}).`); }
      
      if (vendor_id && vendor_id !== parentTx.vendor_id.toString()) {
        await Transaction.updateVendor(id, vendor_id, database);
      }

      await SplitTransaction.deleteByTransactionId(id, database);
      await Transaction.markAsSplit(id, database);
      await SplitTransaction.bulkCreate(id, splits, database);

      await database.exec('COMMIT');
      res.status(200).json({ message: 'Transaction split successfully.' });
    } catch (error) {
      await database.exec('ROLLBACK');
      res.status(500).json({ message: error.message || 'Server error splitting transaction.' });
    }
  }
}

module.exports = TransactionController;