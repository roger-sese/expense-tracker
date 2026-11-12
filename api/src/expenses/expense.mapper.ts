import { Expense } from './expense.entity';
import { fromCents } from '../common/money';

export interface ExpenseView {
  id: number;
  description: string;
  amount: number;
  date: string;
  notes: string | null;
  category: { id: number; name: string; color: string } | null;
}

export const toExpenseView = (e: Expense): ExpenseView => ({
  id: e.id,
  description: e.description,
  amount: fromCents(e.amountCents),
  date: e.date,
  notes: e.notes,
  category: e.category
    ? { id: e.category.id, name: e.category.name, color: e.category.color }
    : null,
});
