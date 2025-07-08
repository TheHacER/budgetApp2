const db = require('../config/database');

class SplitTransaction {
  static async bulkCreate(transactionId, splits, dbInstance) {
    if (!splits || splits.length === 0) return;
    const database = dbInstance || await db.openDb();
    const sql = `INSERT INTO split_transactions (transaction_id, subcategory_id, amount, notes) VALUES (?, ?, ?, ?)`;
    const stmt = await database.prepare(sql);
    try {
      for (const split of splits) {
        await stmt.run(transactionId, split.subcategory_id, split.amount, split.notes || null);
      }
    } finally {
      await stmt.finalize();
    }
  }

  static async deleteByTransactionId(transactionId, dbInstance) {
    const database = dbInstance || await db.openDb();
    const sql = 'DELETE FROM split_transactions WHERE transaction_id = ?';
    await database.run(sql, [transactionId]);
  }
}

module.exports = SplitTransaction;
