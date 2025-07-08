const AppSettings = require('../models/AppSettings');
const PublicHoliday = require('../models/PublicHoliday');

class FinancialMonthService {
  constructor(settings, holidays) {
    this.fiscalDayStart = settings.fiscal_day_start;
    this.holidays = holidays;
  }

  isWorkday(date) {
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) return false;
    const isoDate = date.toISOString().split('T')[0];
    if (this.holidays.has(isoDate)) return false;
    return true;
  }

  getPreviousWorkday(date) {
    let newDate = new Date(date);
    while (!this.isWorkday(newDate)) {
      newDate.setDate(newDate.getDate() - 1);
    }
    return newDate;
  }

  getFinancialMonthRange(year, month) {
    const targetStartDate = new Date(year, month - 2, this.fiscalDayStart);
    const fiscalMonthStartDate = this.getPreviousWorkday(targetStartDate);
    const targetEndDate = new Date(year, month - 1, this.fiscalDayStart);
    const nextFiscalMonthStartDate = this.getPreviousWorkday(targetEndDate);
    const fiscalMonthEndDate = new Date(nextFiscalMonthStartDate);
    fiscalMonthEndDate.setDate(fiscalMonthEndDate.getDate() - 1);

    return {
      startDate: fiscalMonthStartDate.toISOString().split('T')[0],
      endDate: fiscalMonthEndDate.toISOString().split('T')[0],
    };
  }
}

async function createFinancialMonthService() {
  const settings = await AppSettings.get();
  if (!settings) { throw new Error("Application settings have not been configured."); }
  const holidays = await PublicHoliday.getAllAsSet();
  return new FinancialMonthService(settings, holidays);
}

module.exports = { createFinancialMonthService };
