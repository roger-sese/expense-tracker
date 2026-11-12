import type { ExpenseInput } from '@/lib/types';

/** Raw form state: everything is a string until validated. */
export interface ExpenseFormValues {
  description: string;
  amount: string;
  date: string;
  categoryId: string;
  notes: string;
}

export type ExpenseFormErrors = Partial<Record<keyof ExpenseFormValues, string>>;

export function validateExpense(v: ExpenseFormValues): {
  errors: ExpenseFormErrors;
  data?: ExpenseInput;
} {
  const errors: ExpenseFormErrors = {};
  const amount = Number(v.amount);

  if (!v.description.trim()) errors.description = 'Description is required';
  else if (v.description.trim().length > 120) errors.description = 'Keep it under 120 characters';

  if (!v.amount.trim() || Number.isNaN(amount)) errors.amount = 'Enter an amount';
  else if (amount <= 0) errors.amount = 'Amount must be greater than 0';
  else if (!/^\d+(\.\d{1,2})?$/.test(v.amount.trim())) errors.amount = 'Use at most 2 decimal places';

  if (!/^\d{4}-\d{2}-\d{2}$/.test(v.date)) errors.date = 'Pick a date';
  if (!v.categoryId) errors.categoryId = 'Choose a category';
  if (v.notes.length > 500) errors.notes = 'Keep notes under 500 characters';

  if (Object.keys(errors).length > 0) return { errors };
  return {
    errors,
    data: {
      description: v.description.trim(),
      amount,
      date: v.date,
      categoryId: Number(v.categoryId),
      notes: v.notes.trim(),
    },
  };
}
