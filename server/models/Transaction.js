const db = require('../config/database');

class Transaction {
  static async exists(tx) {
    const database = await db.openDb();
    const sql = `SELECT 1 FROM transactions WHERE transaction_date = ? AND amount = ? AND is_debit = ? LIMIT 1`;
    const sqlInverse = `SELECT 1 FROM transactions WHERE transaction_date = ? AND amount = ? AND is_debit = ? LIMIT 1`;
    const result = await database.get(sql, [tx.transaction_date, tx.amount, tx.is_debit]);
    const inverseResult = await database.get(sqlInverse, [tx.transaction_date, tx.amount, !tx.is_debit]);
    return !!result || !!inverseResult;
  }

  static async bulkCreate(transactions) {
    if (transactions.length === 0) return;
    const database = await db.openDb();
    await database.exec('BEGIN TRANSACTION');
    try {
      const sql = `INSERT INTO transactions (transaction_date, description_original, amount, is_debit, source_account, vendor_id, subcategory_id) VALUES (?, ?, ?, ?, ?, ?, ?)`;
      const stmt = await database.prepare(sql);
      for (const tx of transactions) {
        await stmt.run(tx.transaction_date, tx.description_original, tx.amount, tx.is_debit, tx.source_account, tx.vendor_id, tx.subcategory_id);
      }
      await stmt.finalize();
      await database.exec('COMMIT');
    } catch (error) {
      await database.exec('ROLLBACK');
      console.error('Failed to bulk insert transactions:', error);
      throw error;
    }
  }

  static async findAll() {
    const database = await db.openDb();
    const sql = `
      SELECT t.*, s.name as subcategory_name, c.name as category_name, v.display_name as vendor_name
      FROM transactions t
      LEFT JOIN subcategories s ON t.subcategory_id = s.id
      LEFT JOIN categories c ON s.category_id = c.id
      LEFT JOIN vendors v ON t.vendor_id = v.id
      ORDER BY t.transaction_date DESC, t.id DESC
    `;
    return await database.all(sql);
  }

  static async findById(id, dbInstance) {
    const database = dbInstance || await db.openDb();
    return await database.get('SELECT * FROM transactions WHERE id = ?', [id]);
  }

  static async findUncategorized() {
    const database = await db.openDb();
    return await database.all('SELECT * FROM transactions WHERE subcategory_id IS NULL ORDER BY transaction_date DESC');
  }

  static async updateCategory(transactionId, subcategoryId) {
    const database = await db.openDb();
    await database.run('DELETE FROM split_transactions WHERE transaction_id = ?', [transactionId]);
    const result = await database.run('UPDATE transactions SET subcategory_id = ?, is_split = 0 WHERE id = ?', [subcategoryId, transactionId]);
    return result.changes;
  }

  static async updateVendor(transactionId, vendorId) {
    const database = await db.openDb();
    const result = await database.run('UPDATE transactions SET vendor_id = ? WHERE id = ?', [vendorId, transactionId]);
    return result.changes;
  }

  static async markAsSplit(transactionId, dbInstance) {
    const sql = 'UPDATE transactions SET subcategory_id = NULL, is_split = 1 WHERE id = ?';
    const dbToUse = dbInstance || await db.openDb();
    await dbToUse.run(sql, [transactionId]);
  }

  static async getSummaryByDateRange(startDate, endDate) {
    const database = await db.openDb();
    const result = await database.get('SELECT SUM(CASE WHEN is_debit = 1 THEN amount ELSE 0 END) as total_spending, SUM(CASE WHEN is_debit = 0 THEN amount ELSE 0 END) as total_income FROM transactions WHERE transaction_date BETWEEN ? AND ?', [startDate, endDate]);
    return { total_spending: result.total_spending || 0, total_income: result.total_income || 0 };
  }

  static async getSpendingByCategory(startDate, endDate) {
    const database = await db.openDb();
    const sql = `
      SELECT
          c.id as category_id,
          c.name as category_name,
          SUM(s.amount) as actual_spending
      FROM (
          SELECT s.category_id, t.amount
          FROM transactions t
          JOIN subcategories s ON t.subcategory_id = s.id
          WHERE t.is_debit = 1 AND t.is_split = 0 AND t.transaction_date BETWEEN ? AND ?

          UNION ALL

          SELECT s.category_id, st.amount
          FROM split_transactions st
          JOIN transactions t ON st.transaction_id = t.id
          JOIN subcategories s ON st.subcategory_id = s.id
          WHERE t.is_debit = 1 AND t.transaction_date BETWEEN ? AND ?
      ) AS s
      JOIN categories c ON s.category_id = c.id
      GROUP BY c.id, c.name
      ORDER BY actual_spending DESC;
    `;
    return await database.all(sql, [startDate, endDate, startDate, endDate]);
  }
}

module.exports = Transaction;
