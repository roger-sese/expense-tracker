'use client';

import { Suspense, useState } from 'react';
import { Alert, ButtonLink, Card, EmptyState, PageHeader, PageLoader, Pagination } from '@/components/ui';
import { useCategories } from '@/features/categories/hooks';
import { useDeleteExpense, useExpenses } from '@/features/expenses/hooks';
import { ExpenseFilters } from '@/features/expenses/ExpenseFilters';
import { ExpenseList } from '@/features/expenses/ExpenseList';
import { useFilterParams } from '@/features/expenses/use-filter-params';
import { formatMoney } from '@/lib/format';
import type { Expense } from '@/lib/types';

function ExpensesContent() {
  const [filters, setFilters] = useFilterParams();
  const { data, isPending, error, isFetching } = useExpenses(filters);
  const { data: categories = [] } = useCategories();
  const deleteExpense = useDeleteExpense();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleDelete(expense: Expense) {
    if (!window.confirm(`Delete "${expense.description}" (${formatMoney(expense.amount)})?`)) return;
    setDeletingId(expense.id);
    setDeleteError(null);
    try {
      await deleteExpense.mutateAsync(expense.id);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <PageHeader
        title="Expenses"
        subtitle={data ? `${data.total} expense${data.total === 1 ? '' : 's'}` : undefined}
        actions={<ButtonLink href="/expenses/new">Add expense</ButtonLink>}
      />
      <Card>
        <ExpenseFilters value={filters} categories={categories} onChange={setFilters} />
      </Card>
      {(error || deleteError) && <Alert>{error?.message ?? deleteError}</Alert>}
      <Card className={isFetching && !isPending ? 'is-refreshing' : undefined}>
        {isPending ? (
          <PageLoader />
        ) : data && data.items.length > 0 ? (
          <>
            <ExpenseList expenses={data.items} onDelete={handleDelete} deletingId={deletingId} />
            <Pagination
              page={data.page}
              limit={data.limit}
              total={data.total}
              onPageChange={(page) => setFilters({ ...filters, page })}
            />
          </>
        ) : (
          <EmptyState
            title="No expenses found"
            description="Try changing the filters, or add a new expense."
            action={<ButtonLink href="/expenses/new" size="sm">Add expense</ButtonLink>}
          />
        )}
      </Card>
    </>
  );
}

export default function ExpensesPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <ExpensesContent />
    </Suspense>
  );
}
