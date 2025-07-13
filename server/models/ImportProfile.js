const db = require('../config/database');

class ImportProfile {
  static async findAll() {
    const database = await db.openDb();
    return await database.all('SELECT * FROM import_profiles ORDER BY profile_name');
  }

  static async findById(id) {
    const database = await db.openDb();
    return await database.get('SELECT * FROM import_profiles WHERE id = ?', [id]);
  }

  static async create(profileData) {
    const { profile_name, date_col, description_col, amount_col, debit_col, credit_col, date_format } = profileData;
    const database = await db.openDb();
    const sql = `
        INSERT INTO import_profiles (profile_name, date_col, description_col, amount_col, debit_col, credit_col, date_format) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const result = await database.run(sql, [profile_name, date_col, description_col, amount_col, debit_col, credit_col, date_format]);
    return { id: result.lastID, ...profileData };
  }

  static async update(id, profileData) {
    const { profile_name, date_col, description_col, amount_col, debit_col, credit_col, date_format } = profileData;
    const database = await db.openDb();
    const sql = `
        UPDATE import_profiles SET 
        profile_name = ?, date_col = ?, description_col = ?, amount_col = ?, debit_col = ?, credit_col = ?, date_format = ?
        WHERE id = ?
    `;
    await database.run(sql, [profile_name, date_col, description_col, amount_col, debit_col, credit_col, date_format, id]);
    return { id, ...profileData };
  }

  static async delete(id) {
    const database = await db.openDb();
    await database.run('DELETE FROM import_profiles WHERE id = ?', [id]);
  }
}

module.exports = ImportProfile;