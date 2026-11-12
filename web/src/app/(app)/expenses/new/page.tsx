'use client';

import { useRouter } from 'next/navigation';
import { Alert, ButtonLink, Card, EmptyState, PageHeader, PageLoader } from '@/components/ui';
import { useCategories } from '@/features/categories/hooks';
import { useCreateExpense } from '@/features/expenses/hooks';
import { ExpenseForm } from '@/features/expenses/ExpenseForm';

export default function NewExpensePage() {
  const router = useRouter();
  const { data: categories, isPending, error } = useCategories();
  const createExpense = useCreateExpense();

  return (
    <>
      <PageHeader title="Add expense" subtitle="Log something you spent money on." />
      <Card className="card--narrow">
        {error && <Alert>{error.message}</Alert>}
        {isPending ? (
          <PageLoader />
        ) : categories && categories.length > 0 ? (
          <ExpenseForm
            categories={categories}
            submitLabel="Save expense"
            onSubmit={async (data) => {
              await createExpense.mutateAsync(data);
              router.push('/expenses');
            }}
          />
        ) : (
          <EmptyState
            title="You need a category first"
            action={<ButtonLink href="/categories" size="sm">Create a category</ButtonLink>}
          />
        )}
      </Card>
    </>
  );
}
