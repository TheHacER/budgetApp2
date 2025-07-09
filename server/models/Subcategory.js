const db = require('../config/database');

class Subcategory {
  static async create(name, category_id) {
    const database = await db.openDb();
    const sql = `INSERT INTO subcategories (name, category_id) VALUES (?, ?)`;
    const result = await database.run(sql, [name, category_id]);
    return { id: result.lastID, name, category_id };
  }

  static async findAllWithParent() {
    const database = await db.openDb();
    const sql = `
      SELECT 
        s.id, 
        s.name, 
        c.name as category_name 
      FROM subcategories s
      JOIN categories c ON s.category_id = c.id
      ORDER BY c.name, s.name
    `;
    return await database.all(sql);
  }

  static async delete(id) {
    const database = await db.openDb();
    const sql = `DELETE FROM subcategories WHERE id = ?`;
    return await database.run(sql, [id]);
  }

  static async findParentCategory(subcategoryId) {
    const database = await db.openDb();
    const sql = `SELECT category_id FROM subcategories WHERE id = ?`;
    return await database.get(sql, [subcategoryId]);
  }
}

module.exports = Subcategory;