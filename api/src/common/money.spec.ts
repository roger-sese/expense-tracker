import { fromCents, toCents } from './money';

describe('money helpers', () => {
  it('converts decimals to integer cents without float drift', () => {
    expect(toCents(0.1 + 0.2)).toBe(30);
    expect(toCents(19.99)).toBe(1999);
  });

  it('converts cents back to decimals', () => {
    expect(fromCents(1999)).toBe(19.99);
  });
});
