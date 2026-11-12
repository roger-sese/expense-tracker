import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExpenseForm } from './ExpenseForm';
import type { Category, Expense } from '@/lib/types';

const categories: Category[] = [
  { id: 1, name: 'Food', color: '#f97316' },
  { id: 2, name: 'Bills', color: '#ef4444' },
];

describe('ExpenseForm', () => {
  it('shows field errors and does not submit invalid data', async () => {
    const onSubmit = vi.fn();
    render(<ExpenseForm categories={categories} submitLabel="Save expense" onSubmit={onSubmit} />);
    await userEvent.click(screen.getByRole('button', { name: 'Save expense' }));
    expect(screen.getByText('Description is required')).toBeInTheDocument();
    expect(screen.getByText('Enter an amount')).toBeInTheDocument();
    expect(screen.getByText('Choose a category')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits a new expense', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<ExpenseForm categories={categories} submitLabel="Save expense" onSubmit={onSubmit} />);
    await userEvent.type(screen.getByLabelText('Description'), 'Pizza');
    await userEvent.type(screen.getByLabelText('Amount (USD)'), '18.25');
    await userEvent.selectOptions(screen.getByLabelText('Category'), '1');
    await userEvent.click(screen.getByRole('button', { name: 'Save expense' }));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ description: 'Pizza', amount: 18.25, categoryId: 1 }),
    );
  });

  it('pre-fills values when editing and surfaces server errors', async () => {
    const expense: Expense = {
      id: 9,
      description: 'Electricity',
      amount: 95.3,
      date: '2025-02-01',
      notes: null,
      category: categories[1],
    };
    const onSubmit = vi.fn().mockRejectedValue(new Error('Category not found'));
    render(<ExpenseForm categories={categories} initial={expense} submitLabel="Save changes" onSubmit={onSubmit} />);

    expect(screen.getByLabelText('Description')).toHaveValue('Electricity');
    expect(screen.getByLabelText('Amount (USD)')).toHaveValue(95.3);
    expect(screen.getByLabelText('Category')).toHaveValue('2');

    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    expect(await screen.findByText('Category not found')).toBeInTheDocument();
  });
});
