const db = require('../config/database');

class Budget {
  static async bulkSet(budgets) {
    const database = await db.openDb();
    await database.exec('BEGIN TRANSACTION');
    try {
      const sql = `INSERT INTO budgets (category_id, year, month, amount) VALUES (?, ?, ?, ?) ON CONFLICT(category_id, year, month) DO UPDATE SET amount = excluded.amount;`;
      const stmt = await database.prepare(sql);
      for (const budget of budgets) {
        await stmt.run(budget.category_id, budget.year, budget.month, parseFloat(budget.amount || 0));
      }
      await stmt.finalize();
      await database.exec('COMMIT');
    } catch (error) {
      await database.exec('ROLLBACK');
      throw error;
    }
  }

  static async getCategoryBudgetsForMonth(year, month, startDate, endDate) {
    const database = await db.openDb();
    const sql = `
      SELECT
        c.id as category_id,
        c.name as category_name,
        COALESCE(b.amount, 0) as budgeted_amount,
        COALESCE(rb_sum.total_recurring_bills, 0) as recurring_bills_total
      FROM categories c
      LEFT JOIN (
        SELECT category_id, amount FROM budgets WHERE year = ? AND month = ?
      ) b ON c.id = b.category_id
      LEFT JOIN (
        SELECT s.category_id, SUM(rb.amount) as total_recurring_bills
        FROM recurring_bills rb
        JOIN subcategories s ON rb.subcategory_id = s.id
        WHERE 
          rb.is_active = 1 AND
          rb.start_date <= ? AND
          (rb.end_date_is_indefinite = 1 OR rb.end_date IS NULL OR rb.end_date >= ?)
        GROUP BY s.category_id
      ) rb_sum ON c.id = rb_sum.category_id
      ORDER BY c.name;
    `;
    return await database.all(sql, [year, month, endDate, startDate]);
  }
}

module.exports = Budget;
