const AppSettings = require('../models/AppSettings');
const { getPreviousWorkday, getHolidays } = require('./dateHelpers');

class FinancialMonthService {
  constructor(settings, holidays) {
    this.fiscalDayStart = settings.fiscal_day_start;
    this.holidays = holidays;
  }

  getFinancialMonthRange(year, month) {
    // Note: JS months are 0-indexed, so month - 1 for current month, month - 2 for previous.
    const targetStartDate = new Date(year, month - 2, this.fiscalDayStart);
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
}

async function createFinancialMonthService() {
  const [settings, holidays] = await Promise.all([
    AppSettings.get(),
    getHolidays()
  ]);
  if (!settings) { throw new Error("Application settings have not been configured."); }
  return new FinancialMonthService(settings, holidays);
}

module.exports = { createFinancialMonthService };