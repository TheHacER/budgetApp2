const { getFinancialYearSettings, setFinancialYearSettings, getAvailableMonths } = require('../services/financialMonthService');
const { fetchAndStoreHolidays } = require('../services/holidayService');

exports.getFinancialYear = async (req, res) => {
    try {
        const settings = await getFinancialYearSettings();
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching financial year settings', error: error.message });
    }
};

exports.setFinancialYear = async (req, res) => {
    try {
        const settings = await setFinancialYearSettings(req.body);
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: 'Error setting financial year', error: error.message });
    }
};

exports.getFinancialMonths = async (req, res) => {
    try {
        const months = await getAvailableMonths();
        res.json(months);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching financial months', error: error.message });
    }
};

// NEW FUNCTION TO HANDLE HOLIDAY REFRESH
exports.refreshHolidays = async (req, res) => {
    try {
        await fetchAndStoreHolidays();
        res.status(200).json({ message: 'Public holidays have been successfully refreshed.' });
    } catch (error) {
        console.error('Error refreshing public holidays:', error);
        res.status(500).json({ message: 'Failed to refresh public holidays.', error: error.message });
    }
};