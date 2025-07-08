const RecurringBill = require('../models/RecurringBill');

function isWeekend(date) {
  const day = date.getDay();
  return day === 6 || day === 0;
}

const BANK_HOLIDAYS = [
  '2025-08-25',
  '2025-12-25',
  '2025-12-26',
];

class ForecastService {
  static async generateForecast() {
    let currentBalance = 0;
    const forecastDays = [];
    const today = new Date();
    const forecastEndDate = new Date();
    forecastEndDate.setMonth(forecastEndDate.getMonth() + 12);

    const activeBills = await RecurringBill.findAllActive();

    for (let d = new Date(today); d <= forecastEndDate; d.setDate(d.getDate() + 1)) {
      const currentDate = new Date(d);
      const isoDate = currentDate.toISOString().split('T')[0];
      let dailyOutflow = 0;
      const todaysBills = [];

      for (const bill of activeBills) {
        let paymentDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), bill.day_of_month);

        if (paymentDate.getMonth() === currentDate.getMonth()) {
          while (isWeekend(paymentDate) || BANK_HOLIDAYS.includes(paymentDate.toISOString().split('T')[0])) {
            paymentDate.setDate(paymentDate.getDate() - 1);
          }

          if (paymentDate.toISOString().split('T')[0] === isoDate) {
            dailyOutflow += bill.amount;
            todaysBills.push({
              name: bill.vendor_name,
              amount: bill.amount
            });
          }
        }
      }

      currentBalance -= dailyOutflow;

      forecastDays.push({
        date: isoDate,
        outflows: todaysBills,
        total_outflow: dailyOutflow,
        running_balance: Math.round(currentBalance * 100) / 100
      });
    }

    return forecastDays;
  }
}

module.exports = ForecastService;
