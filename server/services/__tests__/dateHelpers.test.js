const { isWeekend } = require('../dateHelpers');

describe('isWeekend', () => {
  test('returns true for Saturday', () => {
    expect(isWeekend(new Date('2023-09-09'))).toBe(true);
  });

  test('returns true for Sunday', () => {
    expect(isWeekend(new Date('2023-09-10'))).toBe(true);
  });

  test('returns false for weekday', () => {
    expect(isWeekend(new Date('2023-09-11'))).toBe(false);
  });
});
