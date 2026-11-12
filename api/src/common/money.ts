/** Converts a decimal amount (e.g. 12.34) to integer cents (1234). */
export const toCents = (amount: number): number => Math.round(amount * 100);

/** Converts integer cents (1234) to a decimal amount (12.34). */
export const fromCents = (cents: number): number => cents / 100;
