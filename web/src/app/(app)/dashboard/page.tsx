'use client';

import { useState } from 'react';
import { Alert, ButtonLink, Card, EmptyState, PageHeader, PageLoader } from '@/components/ui';
import { useAuth } from '@/features/auth/AuthProvider';
import { useMonthlySummary } from '@/features/expenses/hooks';
import { ExpenseList } from '@/features/expenses/ExpenseList';
import { SummaryCards } from '@/features/dashboard/SummaryCards';
import { CategoryBreakdown } from '@/features/dashboard/CategoryBreakdown';
import { currentMonth, formatMonth } from '@/lib/format';

export default function DashboardPage() {
  const { user } = useAuth();
  const [month, setMonth] = useState(currentMonth());
  const { data, isPending, error } = useMonthlySummary(month);

  return (
    <>
      <PageHeader
        title={`Hi, ${user?.name.split(' ')[0] ?? 'there'}`}
        subtitle={`Your spending for ${formatMonth(month)}`}
        actions={
          <>
            <label className="sr-only" htmlFor="month">
              Month
            </label>
            <input
              id="month"
              type="month"
              className="field__control field__control--inline"
              value={month}
              max={currentMonth()}
              onChange={(e) => e.target.value && setMonth(e.target.value)}
            />
            <ButtonLink href="/expenses/new">Add expense</ButtonLink>
          </>
        }
      />
      {error && <Alert>{error.message}</Alert>}
      {isPending && <PageLoader />}
      {data && (
        <>
          <SummaryCards summary={data} />
          <div className="grid-2">
            <Card title="By category">
              {data.byCategory.length ? (
                <CategoryBreakdown items={data.byCategory} total={data.total} />
              ) : (
                <EmptyState title="No spending this month" description="Expenses you add will be grouped here." />
              )}
            </Card>
            <Card title="Recent" actions={<ButtonLink href={`/expenses?from=${month}-01`} variant="ghost" size="sm">View all</ButtonLink>}>
              {data.recent.length ? (
                <ExpenseList expenses={data.recent} />
              ) : (
                <EmptyState
                  title="Nothing here yet"
                  action={<ButtonLink href="/expenses/new" size="sm">Log your first expense</ButtonLink>}
                />
              )}
            </Card>
          </div>
        </>
      )}
    </>
  );
}
