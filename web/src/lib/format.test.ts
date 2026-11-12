import { describe, expect, it } from 'vitest';
import { formatDate, formatMoney, formatMonth, percentChange, todayIso } from './format';

describe('format helpers', () => {
  it('formats money as Philippine pesos', () => {
    expect(formatMoney(1234.5)).toBe('₱1,234.50');
  });

  it('formats ISO dates without shifting the day across timezones', () => {
    expect(formatDate('2025-01-01')).toBe('Jan 1, 2025');
  });

  it('formats a month key', () => {
    expect(formatMonth('2025-03')).toBe('March 2025');
  });

  it('returns local today as YYYY-MM-DD', () => {
    expect(todayIso(new Date(2025, 6, 4, 23, 30))).toBe('2025-07-04');
  });

  it('computes percent change and handles a zero baseline', () => {
    expect(percentChange(150, 100)).toBe(50);
    expect(percentChange(50, 100)).toBe(-50);
    expect(percentChange(10, 0)).toBeNull();
  });
});
