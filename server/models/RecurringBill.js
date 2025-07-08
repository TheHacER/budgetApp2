const db = require('../config/database');

class RecurringBill {
  static async create(billDetails) {
    const { vendor_id, subcategory_id, amount, day_of_month, start_date, notes, end_date_is_indefinite, end_date } = billDetails;
    const database = await db.openDb();
    const sql = `
      INSERT INTO recurring_bills (vendor_id, subcategory_id, amount, day_of_month, start_date, notes, is_active, end_date_is_indefinite, end_date)
      VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)
    `;
    const result = await database.run(sql, [vendor_id, subcategory_id, amount, day_of_month, start_date, notes, end_date_is_indefinite, end_date]);
    return { id: result.lastID, ...billDetails };
  }

  static async findAllActive() {
    const database = await db.openDb();
    const sql = `
      SELECT
        rb.id, rb.amount, rb.day_of_month, rb.start_date, rb.end_date, rb.notes,
        rb.vendor_id, rb.subcategory_id, rb.end_date_is_indefinite,
        v.display_name as vendor_name, s.name as subcategory_name
      FROM recurring_bills rb
      JOIN vendors v ON rb.vendor_id = v.id
      JOIN subcategories s ON rb.subcategory_id = s.id
      WHERE rb.is_active = 1
      ORDER BY rb.day_of_month
    `;
    return await database.all(sql);
  }

  static async updateAndSupersede(id, newBillDetails, oldBillEndDate) {
    const database = await db.openDb();
    await database.exec('BEGIN TRANSACTION');
    try {
      const deactivateSql = `UPDATE recurring_bills SET is_active = 0, end_date = ? WHERE id = ?`;
      await database.run(deactivateSql, [oldBillEndDate, id]);

      await this.create(newBillDetails);

      await database.exec('COMMIT');
    } catch (error) {
      await database.exec('ROLLBACK');
      console.error("Error in updateAndSupersede:", error);
      throw error;
    }
  }

  static async deactivate(id) {
    const database = await db.openDb();
    const sql = `UPDATE recurring_bills SET is_active = 0, end_date = CURRENT_DATE WHERE id = ?`;
    const result = await database.run(sql, [id]);
    return result.changes;
  }
}

module.exports = RecurringBill;
