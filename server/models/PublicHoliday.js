const db = require('../config/database');

class PublicHoliday {
  static async getAllAsSet() {
    const database = await db.openDb();
    const rows = await database.all('SELECT holiday_date FROM public_holidays');
    return new Set(rows.map(r => r.holiday_date));
  }
}

module.exports = PublicHoliday;
