const db = require('../config/database');

class HolidayService {
  static async fetchAndStoreHolidays(jurisdiction) {
    try {
      const response = await fetch('https://www.gov.uk/bank-holidays.json');
      if (!response.ok) {
        throw new Error(`Failed to fetch holiday data: ${response.statusText}`);
      }
      const allHolidays = await response.json();
      const regionHolidays = allHolidays[jurisdiction];

      if (!regionHolidays || !regionHolidays.events) {
        throw new Error(`No holiday data found for jurisdiction: ${jurisdiction}`);
      }

      const database = await db.openDb();
      await database.exec('BEGIN TRANSACTION');

      await database.run('DELETE FROM public_holidays');

      const sql = `INSERT OR IGNORE INTO public_holidays (holiday_date, name) VALUES (?, ?)`;
      const stmt = await database.prepare(sql);

      for (const event of regionHolidays.events) {
        await stmt.run(event.date, event.title);
      }

      await stmt.finalize();
      await database.exec('COMMIT');
      console.log(`Successfully stored ${regionHolidays.events.length} holidays for ${jurisdiction}.`);

    } catch (error) {
      console.error('Error in fetchAndStoreHolidays:', error);
    }
  }
}

module.exports = HolidayService;
