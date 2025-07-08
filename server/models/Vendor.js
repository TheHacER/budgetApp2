const db = require('../config/database');

class Vendor {
  static async create(name, displayName) {
    const database = await db.openDb();
    const sql = `INSERT INTO vendors (name, display_name) VALUES (?, ?)`;
    const result = await database.run(sql, [name, displayName]);
    return { id: result.lastID, name, displayName };
  }

  static async findAll() {
    const database = await db.openDb();
    const sql = `SELECT * FROM vendors ORDER BY display_name`;
    return await database.all(sql);
  }

  static async findById(id) {
    const database = await db.openDb();
    const sql = `SELECT * FROM vendors WHERE id = ?`;
    return await database.get(sql, [id]);
  }

  static async update(id, name, displayName) {
    const database = await db.openDb();
    const sql = `UPDATE vendors SET name = ?, display_name = ? WHERE id = ?`;
    await database.run(sql, [name, displayName, id]);
    return { id, name, displayName };
  }

  static async delete(id) {
    const database = await db.openDb();
    const sql = `DELETE FROM vendors WHERE id = ?`;
    return await database.run(sql, [id]);
  }
}

module.exports = Vendor;
