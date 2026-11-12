import { formatMoney, percentChange } from '@/lib/format';
import type { MonthlySummary } from '@/lib/types';

export function SummaryCards({ summary }: { summary: MonthlySummary }) {
  const change = percentChange(summary.total, summary.previousMonthTotal);
  const top = summary.byCategory[0];

  return (
    <div className="stats">
      <div className="stat">
        <span className="stat__label">Spent this month</span>
        <span className="stat__value">{formatMoney(summary.total)}</span>
        {change !== null && (
          <span className={`stat__delta ${change > 0 ? 'stat__delta--up' : 'stat__delta--down'}`}>
            {change > 0 ? '▲' : '▼'} {Math.abs(change)}% vs last month
          </span>
        )}
      </div>
      <div className="stat">
        <span className="stat__label">Expenses</span>
        <span className="stat__value">{summary.count}</span>
        <span className="stat__delta">
          {summary.count > 0 ? `Avg ${formatMoney(summary.total / summary.count)}` : 'Nothing logged yet'}
        </span>
      </div>
      <div className="stat">
        <span className="stat__label">Top category</span>
        <span className="stat__value">{top ? top.name : '—'}</span>
        <span className="stat__delta">{top ? formatMoney(top.total) : 'No spending yet'}</span>
      </div>
    </div>
  );
}
