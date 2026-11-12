import { currentMonth, monthRange } from './month-range';

describe('monthRange', () => {
  it('returns first and last day of the month', () => {
    expect(monthRange('2024-02')).toEqual({ from: '2024-02-01', to: '2024-02-29', previous: '2024-01' });
  });

  it('wraps the previous month across a year boundary', () => {
    expect(monthRange('2025-01').previous).toBe('2024-12');
  });

  it('formats the current month as YYYY-MM', () => {
    expect(currentMonth(new Date('2025-07-15T12:00:00Z'))).toBe('2025-07');
  });
});
