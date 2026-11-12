/** Returns the first/last ISO dates of a YYYY-MM month plus the previous month key. */
export function monthRange(month: string): { from: string; to: string; previous: string } {
  const [y, m] = month.split('-').map(Number);
  const lastDay = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const prev = new Date(Date.UTC(y, m - 2, 1));
  const pad = (n: number) => String(n).padStart(2, '0');
  return {
    from: `${month}-01`,
    to: `${month}-${pad(lastDay)}`,
    previous: `${prev.getUTCFullYear()}-${pad(prev.getUTCMonth() + 1)}`,
  };
}

export const currentMonth = (now = new Date()): string => now.toISOString().slice(0, 7);
