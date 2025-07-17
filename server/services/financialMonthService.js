const AppSettings = require('../models/AppSettings');
const { getPreviousWorkday, getHolidays } = require('./dateHelpers');

class FinancialMonthService {
  constructor(settings, holidays) {
    this.fiscalDayStart = settings.fiscal_day_start;
    this.holidays = holidays;
  }

  getFinancialMonthRange(year, month) {
    const targetStartDate = new Date(year, month - 1, this.fiscalDayStart);
    targetStartDate.setMonth(targetStartDate.getMonth() - 1);
    const fiscalMonthStartDate = getPreviousWorkday(targetStartDate, this.holidays);

    const targetEndDate = new Date(year, month - 1, this.fiscalDayStart);
    const nextFiscalMonthStartDate = getPreviousWorkday(targetEndDate, this.holidays);
    
    const fiscalMonthEndDate = new Date(nextFiscalMonthStartDate);
    fiscalMonthEndDate.setDate(fiscalMonthEndDate.getDate() - 1);

    return {
      startDate: fiscalMonthStartDate.toISOString().split('T')[0],
      endDate: fiscalMonthEndDate.toISOString().split('T')[0],
    };
  }

  getCurrentFinancialMonth() {
    const today = new Date();
    let year = today.getFullYear();
    let month = today.getMonth() + 1; // getMonth() is 0-indexed

    if (today.getDate() >= this.fiscalDayStart) {
      month += 1;
      if (month > 12) {
        month = 1;
        year += 1;
      }
    }
    
    const range = this.getFinancialMonthRange(year, month);

    return {
      year,
      month,
      startDate: range.startDate,
      endDate: range.endDate,
    };
  }
}

async function createFinancialMonthService() {
  const [settings, holidays] = await Promise.all([
    AppSettings.get(),
    getHolidays()
  ]);
  // Return null if settings are not yet configured, instead of throwing an error.
  if (!settings || !settings.fiscal_day_start) { 
    return null;
  }
  return new FinancialMonthService(settings, holidays);
}

module.exports = { createFinancialMonthService };