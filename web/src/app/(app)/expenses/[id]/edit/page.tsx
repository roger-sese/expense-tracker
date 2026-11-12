'use client';

import { useParams, useRouter } from 'next/navigation';
import { Alert, ButtonLink, Card, EmptyState, PageHeader, PageLoader } from '@/components/ui';
import { useCategories } from '@/features/categories/hooks';
import { useExpense, useUpdateExpense } from '@/features/expenses/hooks';
import { ExpenseForm } from '@/features/expenses/ExpenseForm';
import { ApiError } from '@/lib/api-client';

export default function EditExpensePage() {
  const router = useRouter();
  const id = Number(useParams<{ id: string }>().id);
  const expense = useExpense(id);
  const categories = useCategories();
  const updateExpense = useUpdateExpense(id);

  const notFound =
    !Number.isInteger(id) || (expense.error instanceof ApiError && expense.error.status === 404);

  return (
    <>
      <PageHeader title="Edit expense" />
      <Card className="card--narrow">
        {notFound ? (
          <EmptyState
            title="Expense not found"
            description="It may have been deleted."
            action={<ButtonLink href="/expenses" size="sm">Back to expenses</ButtonLink>}
          />
        ) : expense.error || categories.error ? (
          <Alert>{(expense.error ?? categories.error)?.message}</Alert>
        ) : expense.data && categories.data ? (
          <ExpenseForm
            initial={expense.data}
            categories={categories.data}
            submitLabel="Save changes"
            onSubmit={async (data) => {
              await updateExpense.mutateAsync(data);
              router.push('/expenses');
            }}
          />
        ) : (
          <PageLoader />
        )}
      </Card>
    </>
  );
}
