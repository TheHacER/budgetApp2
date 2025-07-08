const db = require('../config/database');

class CategorizationRule {
  static async findRuleByVendor(vendorId) {
    const database = await db.openDb();
    const sql = 'SELECT * FROM categorization_rules WHERE vendor_id = ?';
    return await database.get(sql, [vendorId]);
  }

  static async createOrUpdateRule(vendorId, subcategoryId) {
    const database = await db.openDb();
    const sql = `
      INSERT INTO categorization_rules (vendor_id, subcategory_id)
      VALUES (?, ?)
      ON CONFLICT(vendor_id) DO UPDATE SET
        subcategory_id = excluded.subcategory_id;
    `;
    await database.run(sql, [vendorId, subcategoryId]);
  }
}

module.exports = CategorizationRule;
