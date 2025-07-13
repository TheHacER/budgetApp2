const db = require('../config/database');

class Budget {
  static async bulkSet(budgets) {
    const database = await db.openDb();
    await database.exec('BEGIN TRANSACTION');
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
      await database.exec('COMMIT');
    } catch (error) {
      await database.exec('ROLLBACK');
      throw error;
    }
  }

  static async getBudgetsBySubCategoryForMonth(year, month) {
    const database = await db.openDb();
    const sql = `
      SELECT
        sc.id as subcategory_id,
        sc.name as subcategory_name,
        c.id as category_id,
        c.name as category_name,
        COALESCE(b.amount, 0) as budgeted_amount,
        COALESCE(b.budget_type, 'allowance') as budget_type
      FROM subcategories sc
      JOIN categories c ON sc.category_id = c.id
      LEFT JOIN (
        SELECT subcategory_id, amount, budget_type FROM budgets WHERE year = ? AND month = ?
      ) b ON sc.id = b.subcategory_id
      ORDER BY c.name, sc.name;
    `;
    return await database.all(sql, [year, month]);
  }

  static async getPreviousMonthSurplus(subcategoryId, year, month) {
    let prevMonth = month - 1;
    let prevYear = year;
    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear = year - 1;
    }
    
    const database = await db.openDb();
    const historySql = `
        SELECT final_surplus_or_rollover 
        FROM monthly_history 
        WHERE subcategory_id = ? AND year = ? AND month = ? AND budget_type = 'rolling'
    `;
    const history = await database.get(historySql, [subcategoryId, prevYear, prevMonth]);

    return history ? history.final_surplus_or_rollover : 0;
  }

   static async isMonthClosed(year, month) {
    const database = await db.openDb();
    const res = await database.get('SELECT 1 FROM monthly_history WHERE year = ? AND month = ? AND is_closed = 1 LIMIT 1', [year, month]);
    return !!res;
   }
}

module.exports = Budget;