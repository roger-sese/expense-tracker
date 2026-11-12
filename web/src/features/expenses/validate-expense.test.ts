import { describe, expect, it } from 'vitest';
import { validateExpense, type ExpenseFormValues } from './validate-expense';

const valid: ExpenseFormValues = {
  description: ' Lunch ',
  amount: '12.50',
  date: '2025-03-10',
  categoryId: '3',
  notes: ' with team ',
};

describe('validateExpense', () => {
  it('parses valid input into an API payload', () => {
    expect(validateExpense(valid).data).toEqual({
      description: 'Lunch',
      amount: 12.5,
      date: '2025-03-10',
      categoryId: 3,
      notes: 'with team',
    });
  });

  it.each([
    ['description', { description: '  ' }],
    ['amount', { amount: '' }],
    ['amount', { amount: '-5' }],
    ['amount', { amount: '1.234' }],
    ['date', { date: '' }],
    ['categoryId', { categoryId: '' }],
  ])('rejects an invalid %s', (field, patch) => {
    const { errors, data } = validateExpense({ ...valid, ...patch });
    expect(data).toBeUndefined();
    expect(errors).toHaveProperty(field);
  });
});
