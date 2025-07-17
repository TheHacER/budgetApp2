const db = require('../config/database');

class SavingsAccount {
  static async create(accountData) {
    const { name, institution, account_number, current_balance } = accountData;
    const database = await db.openDb();
    const sql = `INSERT INTO savings_accounts (name, institution, account_number, current_balance) VALUES (?, ?, ?, ?)`;
    const result = await database.run(sql, [name, institution, account_number, current_balance || 0]);
    return { id: result.lastID, ...accountData };
  }

  static async findAll() {
    const database = await db.openDb();
    const accounts = await database.all('SELECT * FROM savings_accounts');
    const goals = await database.all('SELECT * FROM savings_goals');
    
    // Manually join in JavaScript to avoid potential SQL JSON issues in some environments
    return accounts.map(acc => ({
      ...acc,
      goals: goals.filter(g => g.account_id === acc.id)
    }));
  }

  static async findById(id) {
    const database = await db.openDb();
    const sql = `SELECT * FROM savings_accounts WHERE id = ?`;
    return await database.get(sql, [id]);
  }

  static async update(id, accountData) {
    const { name, institution, account_number, current_balance } = accountData;
    const database = await db.openDb();
    const sql = `UPDATE savings_accounts SET name = ?, institution = ?, account_number = ?, current_balance = ? WHERE id = ?`;
    await database.run(sql, [name, institution, account_number, current_balance, id]);
    return { id, ...accountData };
  }

  static async delete(id) {
    const database = await db.openDb();
    // This will cascade and delete related goals due to the database schema
    const sql = `DELETE FROM savings_accounts WHERE id = ?`;
    return await database.run(sql, [id]);
  }

  static async updateBalance(id, amount, dbInstance) {
    const database = dbInstance || await db.openDb();
    const sql = `UPDATE savings_accounts SET current_balance = current_balance + ? WHERE id = ?`;
    await database.run(sql, [amount, id]);
  }
}

module.exports = SavingsAccount;