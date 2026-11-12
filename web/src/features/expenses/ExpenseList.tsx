import Link from 'next/link';
import { Button, CategoryBadge } from '@/components/ui';
import { formatDate, formatMoney } from '@/lib/format';
import type { Expense } from '@/lib/types';

interface ExpenseListProps {
  expenses: Expense[];
  /** When provided, each row shows Edit/Delete actions. */
  onDelete?: (expense: Expense) => void;
  deletingId?: number | null;
}

/** Reused for the full expenses table and the dashboard's "recent" list. */
export function ExpenseList({ expenses, onDelete, deletingId }: ExpenseListProps) {
  return (
    <ul className="expense-list">
      {expenses.map((e) => (
        <li key={e.id} className="expense-list__item">
          <div className="expense-list__main">
            <span className="expense-list__description">{e.description}</span>
            <span className="expense-list__meta">
              <CategoryBadge category={e.category} />
              <time dateTime={e.date}>{formatDate(e.date)}</time>
            </span>
          </div>
          <span className="expense-list__amount">{formatMoney(e.amount)}</span>
          {onDelete && (
            <span className="expense-list__actions">
              <Link className="btn btn--ghost btn--sm" href={`/expenses/${e.id}/edit`} aria-label={`Edit ${e.description}`}>
                Edit
              </Link>
              <Button
                variant="ghost"
                size="sm"
                className="btn--danger-text"
                isLoading={deletingId === e.id}
                onClick={() => onDelete(e)}
                aria-label={`Delete ${e.description}`}
              >
                Delete
              </Button>
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
