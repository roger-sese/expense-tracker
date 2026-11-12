'use client';

import { useState, type FormEvent } from 'react';
import { Alert, Button, ButtonLink, SelectField, TextAreaField, TextField } from '@/components/ui';
import { todayIso } from '@/lib/format';
import type { Category, Expense, ExpenseInput } from '@/lib/types';
import { validateExpense, type ExpenseFormErrors, type ExpenseFormValues } from './validate-expense';

export interface ExpenseFormProps {
  categories: Category[];
  initial?: Expense;
  submitLabel: string;
  onSubmit: (data: ExpenseInput) => Promise<unknown>;
  cancelHref?: string;
}

const toFormValues = (e?: Expense): ExpenseFormValues => ({
  description: e?.description ?? '',
  amount: e ? String(e.amount) : '',
  date: e?.date ?? todayIso(),
  categoryId: e?.category ? String(e.category.id) : '',
  notes: e?.notes ?? '',
});

/** Shared by the "Add expense" and "Edit expense" screens. */
export function ExpenseForm({ categories, initial, submitLabel, onSubmit, cancelHref = '/expenses' }: ExpenseFormProps) {
  const [values, setValues] = useState(() => toFormValues(initial));
  const [errors, setErrors] = useState<ExpenseFormErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const bind = (key: keyof ExpenseFormValues) => ({
    value: values[key],
    error: errors[key],
    onChange: (e: { target: { value: string } }) => setValues((v) => ({ ...v, [key]: e.target.value })),
  });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const { errors: found, data } = validateExpense(values);
    setErrors(found);
    if (!data) return;
    setServerError(null);
    setSubmitting(true);
    try {
      await onSubmit(data);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Could not save expense');
      setSubmitting(false);
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      {serverError && <Alert>{serverError}</Alert>}
      <TextField label="Description" placeholder="e.g. Groceries" maxLength={120} {...bind('description')} />
      <div className="form__row">
        <TextField label="Amount (₱)" type="number" inputMode="decimal" min="0" step="0.01" {...bind('amount')} />
        <TextField label="Date" type="date" {...bind('date')} />
      </div>
      <SelectField label="Category" {...bind('categoryId')}>
        <option value="">Select a category…</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </SelectField>
      <TextAreaField label="Notes (optional)" maxLength={500} {...bind('notes')} />
      <div className="form__actions">
        <ButtonLink href={cancelHref} variant="ghost">
          Cancel
        </ButtonLink>
        <Button type="submit" isLoading={submitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
