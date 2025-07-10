const db = require('../config/database');

class IgnoredTransaction {
  static async create(tx, reason) {
    const database = await db.openDb();
    const sql = `
      INSERT INTO ignored_transactions 
      (transaction_date, description_original, amount, is_debit, source_account, reason) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    await database.run(sql, [tx.transaction_date, tx.description_original, tx.amount, tx.is_debit, tx.source_account, reason]);
  }

  static async findAll() {
    const database = await db.openDb();
    return await database.all('SELECT * FROM ignored_transactions ORDER BY transaction_date DESC');
  }

  static async findById(id) {
    const database = await db.openDb();
    return await database.get('SELECT * FROM ignored_transactions WHERE id = ?', [id]);
  }

  static async delete(id) {
    const database = await db.openDb();
    await database.run('DELETE FROM ignored_transactions WHERE id = ?', [id]);
  }

  static async deleteAll() {
    const database = await db.openDb();
    await database.run('DELETE FROM ignored_transactions');
  }
}

module.exports = IgnoredTransaction;