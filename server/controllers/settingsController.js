const AppSettings = require('../models/AppSettings');
const HolidayService = require('../services/holidayService');

class SettingsController {
  static async getSettings(req, res) {
    try {
      const settings = await AppSettings.get();
      res.status(200).json(settings || {});
    } catch (error) {
      res.status(500).json({ message: 'Server error fetching settings.' });
    }
  }

  static async saveSettings(req, res) {
    const { fiscal_day_start, jurisdiction } = req.body;
    if (!fiscal_day_start || !jurisdiction) {
      return res.status(400).json({ message: 'Fiscal start day and jurisdiction are required.' });
    }
    try {
      const existingSettings = await AppSettings.get();
      if (existingSettings && existingSettings.setup_complete) {
        return res.status(403).json({ message: 'Initial setup has already been completed and cannot be changed.' });
      }
      await AppSettings.create(fiscal_day_start, jurisdiction);
      await HolidayService.fetchAndStoreHolidays(jurisdiction);
      res.status(201).json({ message: 'Settings saved successfully.' });
    } catch (error) {
      console.error("Error saving settings:", error);
      res.status(500).json({ message: 'Server error saving settings.' });
    }
  }

  static async refreshHolidays(req, res) {
    try {
      const settings = await AppSettings.get();
      if (!settings || !settings.jurisdiction) {
        return res.status(400).json({ message: 'Jurisdiction not set. Cannot refresh holidays.' });
      }
      await HolidayService.fetchAndStoreHolidays(settings.jurisdiction);
      res.status(200).json({ message: 'Public holidays have been successfully updated.' });
    } catch (error) {
        console.error("Error refreshing holidays:", error);
        res.status(500).json({ message: 'Server error refreshing holidays.' });
    }
  }
}

module.exports = SettingsController;