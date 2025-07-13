const PublicHoliday = require('../models/PublicHoliday');

async function getHolidays() {
    return await PublicHoliday.getAllAsSet();
}

function isWeekend(date) {
    const day = date.getDay();
    return day === 0 || day === 6;
}

function getPreviousWorkday(date, holidays) {
    let newDate = new Date(date);
    const isoDate = () => newDate.toISOString().split('T')[0];
    while (isWeekend(newDate) || holidays.has(isoDate())) {
        newDate.setDate(newDate.getDate() - 1);
    }
    return newDate;
}

module.exports = { isWeekend, getPreviousWorkday, getHolidays };