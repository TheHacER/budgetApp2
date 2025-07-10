const RecurringBill = require('../models/RecurringBill');
const PlannedIncome = require('../models/PlannedIncome'); // New
const { isWeekend, getPreviousWorkday, getHolidays } = require('./dateHelpers'); // Refactored for reuse

class ForecastService {
  static async generateForecast() {
    let currentBalance = 0;
    const forecastDays = [];
    const today = new Date();
    const forecastEndDate = new Date();
    forecastEndDate.setMonth(forecastEndDate.getMonth() + 12);

    const [activeBills, activeIncomes, holidays] = await Promise.all([
        RecurringBill.findAllActive(),
        PlannedIncome.findAllActive(),
        getHolidays()
    ]);

    for (let d = new Date(today); d <= forecastEndDate; d.setDate(d.getDate() + 1)) {
      const currentDate = new Date(d);
      const isoDate = currentDate.toISOString().split('T')[0];
      let dailyOutflow = 0;
      let dailyInflow = 0; // New
      const todaysBills = [];
      const todaysIncomes = []; // New

      // Process outflows
      for (const bill of activeBills) {
        let paymentDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), bill.day_of_month);
        if (paymentDate.getMonth() === currentDate.getMonth()) {
          let adjustedDate = getPreviousWorkday(paymentDate, holidays);
          if (adjustedDate.toISOString().split('T')[0] === isoDate) {
            dailyOutflow += bill.amount;
            todaysBills.push({ name: bill.vendor_name, amount: bill.amount });
          }
        }
      }

      // Process inflows
      for (const income of activeIncomes) {
          let incomeDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), income.day_of_month);
           if (incomeDate.getMonth() === currentDate.getMonth()) {
              let adjustedDate = getPreviousWorkday(incomeDate, holidays);
               if (adjustedDate.toISOString().split('T')[0] === isoDate) {
                   dailyInflow += income.amount;
                   todaysIncomes.push({ name: income.source_name, amount: income.amount });
               }
           }
      }

      currentBalance += dailyInflow;
      currentBalance -= dailyOutflow;

      forecastDays.push({
        date: isoDate,
        inflows: todaysIncomes, // New
        outflows: todaysBills,
        total_inflow: dailyInflow, // New
        total_outflow: dailyOutflow,
        running_balance: Math.round(currentBalance * 100) / 100
      });
    }

    return forecastDays;
  }
}

module.exports = ForecastService;