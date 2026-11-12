import { formatMoney } from '@/lib/format';
import type { CategoryTotal } from '@/lib/types';

/** Horizontal bar chart of spending per category (pure CSS, no chart library). */
export function CategoryBreakdown({ items, total }: { items: CategoryTotal[]; total: number }) {
  return (
    <ul className="breakdown">
      {items.map((c) => {
        const pct = total > 0 ? Math.round((c.total / total) * 100) : 0;
        return (
          <li key={c.categoryId} className="breakdown__row">
            <div className="breakdown__label">
              <span>{c.name}</span>
              <span className="muted">
                {formatMoney(c.total)} · {pct}%
              </span>
            </div>
            <div className="breakdown__track" role="meter" aria-label={c.name} aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
              <div className="breakdown__bar" style={{ width: `${pct}%`, backgroundColor: c.color }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
