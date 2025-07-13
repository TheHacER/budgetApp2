const db = require('../config/database');

class RecurringBill {
  static async create(billDetails) {
    const { vendor_id, subcategory_id, amount, day_of_month, start_date, notes, end_date } = billDetails;
    const database = await db.openDb();
    const sql = `
      INSERT INTO recurring_bills (vendor_id, subcategory_id, amount, day_of_month, start_date, notes, end_date, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    `;
    const result = await database.run(sql, [vendor_id, subcategory_id, amount, day_of_month, start_date, notes, end_date]);
    return { id: result.lastID, ...billDetails };
  }

  static async findAllActive() {
    const database = await db.openDb();
    const sql = `
      SELECT
        rb.id, rb.amount, rb.day_of_month, rb.start_date, rb.end_date, rb.notes,
        rb.vendor_id, rb.subcategory_id,
        v.display_name as vendor_name, s.name as subcategory_name
      FROM recurring_bills rb
      JOIN vendors v ON rb.vendor_id = v.id
      JOIN subcategories s ON rb.subcategory_id = s.id
      WHERE rb.is_active = 1
      ORDER BY rb.day_of_month
    `;
    return await database.all(sql);
  }

  static async update(id, newBillDetails) {
    const { vendor_id, subcategory_id, amount, day_of_month, start_date, notes, end_date } = newBillDetails;
    const database = await db.openDb();
    const sql = `UPDATE recurring_bills SET vendor_id = ?, subcategory_id = ?, amount = ?, day_of_month = ?, start_date = ?, notes = ?, end_date = ? WHERE id = ?`;
    await database.run(sql, [vendor_id, subcategory_id, amount, day_of_month, start_date, notes, end_date, id]);
  }


  static async deactivate(id) {
    const database = await db.openDb();
    const sql = `UPDATE recurring_bills SET is_active = 0, end_date = CURRENT_DATE WHERE id = ?`;
    const result = await database.run(sql, [id]);
    return result.changes;
  }
}

module.exports = RecurringBill;