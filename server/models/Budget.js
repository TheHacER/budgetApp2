const db = require('../config/database');

class Budget {
  static async bulkSet(budgets, dbInstance) {
    const database = dbInstance || await db.openDb();
    const useTransaction = !dbInstance; // Only manage transactions if we opened the DB connection

    if (useTransaction) await database.exec('BEGIN TRANSACTION');
    try {
      const sql = `
        INSERT INTO budgets (subcategory_id, year, month, amount, budget_type) 
        VALUES (?, ?, ?, ?, ?) 
        ON CONFLICT(subcategory_id, year, month) 
        DO UPDATE SET amount = excluded.amount, budget_type = excluded.budget_type;
      `;
      const stmt = await database.prepare(sql);
      for (const budget of budgets) {
        await stmt.run(budget.subcategory_id, budget.year, budget.month, parseFloat(budget.amount || 0), budget.budget_type || 'allowance');
      }
      await stmt.finalize();
      if (useTransaction) await database.exec('COMMIT');
    } catch (error) {
      if (useTransaction) await database.exec('ROLLBACK');
      throw error;
    }
  }

  static async getSingleBudget(subcategoryId, year, month, dbInstance) {
    const database = dbInstance || await db.openDb();
    const sql = `SELECT * FROM budgets WHERE subcategory_id = ? AND year = ? AND month = ?`;
    return await database.get(sql, [subcategoryId, year, month]);
  }

  static async getBudgetsBySubCategoryForMonth(year, month) {
    const database = await db.openDb();
    const sql = `
        SELECT 
            b.id,
            s.id as subcategory_id,
            s.name as subcategory_name,
            c.id as category_id,
            c.name as category_name,
            COALESCE(b.amount, 0) as budgeted_amount,
            COALESCE(b.budget_type, 'allowance') as budget_type
        FROM subcategories s
        JOIN categories c ON s.category_id = c.id
        LEFT JOIN budgets b ON s.id = b.subcategory_id AND b.year = ? AND b.month = ?
        ORDER BY c.name, s.name;
    `;
    return await database.all(sql, [year, month]);
  }
}

module.exports = Budget;