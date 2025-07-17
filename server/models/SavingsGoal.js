const db = require('../config/database');

class SavingsGoal {
  static async create(goalData) {
    const { account_id, title, target_amount, current_amount, target_date, priority } = goalData;
    const database = await db.openDb();
    const sql = `INSERT INTO savings_goals (account_id, title, target_amount, current_amount, target_date, priority) VALUES (?, ?, ?, ?, ?, ?)`;
    const result = await database.run(sql, [account_id, title, target_amount, current_amount || 0, target_date, priority]);
    return { id: result.lastID, ...goalData };
  }

  static async update(id, goalData) {
    const { title, target_amount, current_amount, target_date, priority } = goalData;
    const database = await db.openDb();
    const sql = `UPDATE savings_goals SET title = ?, target_amount = ?, current_amount = ?, target_date = ?, priority = ? WHERE id = ?`;
    await database.run(sql, [title, target_amount, current_amount, target_date, priority, id]);
    return { id, ...goalData };
  }

  static async delete(id) {
    const database = await db.openDb();
    const sql = `DELETE FROM savings_goals WHERE id = ?`;
    return await database.run(sql, [id]);
  }

  static async findById(id, dbInstance) {
    const database = dbInstance || await db.openDb();
    const sql = `SELECT * FROM savings_goals WHERE id = ?`;
    return await database.get(sql, [id]);
  }

  static async updateBalance(id, amount, dbInstance) {
    const database = dbInstance || await db.openDb();
    const sql = `UPDATE savings_goals SET current_amount = current_amount + ? WHERE id = ?`;
    await database.run(sql, [amount, id]);
  }
}

module.exports = SavingsGoal;