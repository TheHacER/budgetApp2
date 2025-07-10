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
    // CORRECTED: This query now correctly selects all fields for the nested goals.
    const sql = `
      SELECT 
        sa.*,
        (SELECT json_group_array(
          json_object(
            'id', sg.id, 
            'account_id', sg.account_id,
            'title', sg.title, 
            'target_amount', sg.target_amount, 
            'starting_balance', sg.starting_balance,
            'current_amount', sg.current_amount, 
            'target_date', sg.target_date, 
            'priority', sg.priority
          )
        ) FROM savings_goals sg WHERE sg.account_id = sa.id) as goals
      FROM savings_accounts sa
    `;
    const accounts = await database.all(sql);
    return accounts.map(acc => ({
      ...acc,
      goals: acc.goals ? JSON.parse(acc.goals) : []
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
    const sql = `DELETE FROM savings_accounts WHERE id = ?`;
    return await database.run(sql, [id]);
  }

  static async updateBalance(id, amount) {
    const database = await db.openDb();
    const sql = `UPDATE savings_accounts SET current_balance = current_balance + ? WHERE id = ?`;
    await database.run(sql, [amount, id]);
  }
}

module.exports = SavingsAccount;