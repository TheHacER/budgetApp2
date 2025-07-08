const db = require('../config/database');

class AppSettings {
  static async get() {
    const database = await db.openDb();
    return await database.get('SELECT * FROM app_settings WHERE id = 1');
  }

  static async create(fiscal_day_start, jurisdiction) {
    const database = await db.openDb();
    const sql = `
      INSERT INTO app_settings (id, fiscal_day_start, jurisdiction, setup_complete)
      VALUES (1, ?, ?, 1)
      ON CONFLICT(id) DO NOTHING;
    `;
    return await database.run(sql, [fiscal_day_start, jurisdiction]);
  }
}

module.exports = AppSettings;
