const db = require('../config/database');

class PlannedIncome {
  static async create(incomeData) {
    const { source_name, amount, day_of_month } = incomeData;
    const database = await db.openDb();
    const sql = `INSERT INTO planned_income (source_name, amount, day_of_month) VALUES (?, ?, ?)`;
    const result = await database.run(sql, [source_name, amount, day_of_month]);
    return { id: result.lastID, ...incomeData };
  }

  static async findAllActive() {
    const database = await db.openDb();
    return await database.all('SELECT * FROM planned_income WHERE is_active = 1 ORDER BY day_of_month');
  }

  static async calculateMonthlyTotal() {
    const database = await db.openDb();
    const result = await database.get('SELECT SUM(amount) as total FROM planned_income WHERE is_active = 1');
    return result.total || 0;
  }

  static async update(id, incomeData) {
    const { source_name, amount, day_of_month } = incomeData;
    const database = await db.openDb();
    const sql = `UPDATE planned_income SET source_name = ?, amount = ?, day_of_month = ? WHERE id = ?`;
    await database.run(sql, [source_name, amount, day_of_month, id]);
    return { id, ...incomeData };
  }

  static async deactivate(id) {
    const database = await db.openDb();
    const sql = `UPDATE planned_income SET is_active = 0 WHERE id = ?`;
    return await database.run(sql, [id]);
  }
}

module.exports = PlannedIncome;