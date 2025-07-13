const db = require('../config/database');

class Category {
  static async create(name) {
    const database = await db.openDb();
    const sql = `INSERT INTO categories (name) VALUES (?)`;
    const result = await database.run(sql, [name]);
    return { id: result.lastID, name };
  }

  static async findAll() {
    const database = await db.openDb();
    const sql = `SELECT * FROM categories ORDER BY name`;
    return await database.all(sql);
  }

  static async findAllWithSubcategories() {
    const database = await db.openDb();
    const sql = `
      SELECT
        c.id,
        c.name,
        c.linked_savings_account_id,
        (
          SELECT json_group_array(
            json_object('id', s.id, 'name', s.name)
          )
          FROM subcategories s
          WHERE s.category_id = c.id
          ORDER BY s.name
        ) as subcategories
      FROM categories c
      ORDER BY c.name;
    `;
    const categories = await database.all(sql);
    return categories.map(cat => ({
      ...cat,
      subcategories: cat.subcategories ? JSON.parse(cat.subcategories) : []
    }));
  }

  static async findById(id) {
    const database = await db.openDb();
    const sql = `SELECT * FROM categories WHERE id = ?`;
    return await database.get(sql, [id]);
  }

  static async update(id, { name, linked_savings_account_id }) {
    const database = await db.openDb();
    const sql = `UPDATE categories SET name = ?, linked_savings_account_id = ? WHERE id = ?`;
    await database.run(sql, [name, linked_savings_account_id, id]);
    return { id, name, linked_savings_account_id };
  }

  static async delete(id) {
    const database = await db.openDb();
    const sql = `DELETE FROM categories WHERE id = ?`;
    return await database.run(sql, [id]);
  }
}

module.exports = Category;