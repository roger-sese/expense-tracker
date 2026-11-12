'use client';

import { useState } from 'react';
import { Alert, Button, Card, EmptyState, PageHeader, PageLoader } from '@/components/ui';
import { CategoryForm } from '@/features/categories/CategoryForm';
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from '@/features/categories/hooks';
import type { Category } from '@/lib/types';

export default function CategoriesPage() {
  const { data: categories, isPending, error } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function handleDelete(c: Category) {
    if (!window.confirm(`Delete category "${c.name}"?`)) return;
    setActionError(null);
    try {
      await deleteCategory.mutateAsync(c.id);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Delete failed');
    }
  }

  return (
    <>
      <PageHeader title="Categories" subtitle="Group your expenses the way you think about them." />
      <div className="grid-2 grid-2--sidebar">
        <Card title="New category">
          <CategoryForm submitLabel="Add category" onSubmit={(v) => createCategory.mutateAsync(v)} />
        </Card>
        <Card title="Your categories">
          {(error || actionError) && <Alert>{error?.message ?? actionError}</Alert>}
          {isPending ? (
            <PageLoader />
          ) : categories && categories.length > 0 ? (
            <ul className="category-list">
              {categories.map((c) =>
                editingId === c.id ? (
                  <li key={c.id} className="category-list__item category-list__item--editing">
                    <CategoryForm
                      initialValues={{ name: c.name, color: c.color }}
                      submitLabel="Save"
                      onCancel={() => setEditingId(null)}
                      onSubmit={async (v) => {
                        await updateCategory.mutateAsync({ id: c.id, ...v });
                        setEditingId(null);
                      }}
                    />
                  </li>
                ) : (
                  <li key={c.id} className="category-list__item">
                    <span className="badge__dot badge__dot--lg" style={{ backgroundColor: c.color }} aria-hidden />
                    <span className="category-list__name">{c.name}</span>
                    <span className="muted">
                      {c.expenseCount ?? 0} expense{c.expenseCount === 1 ? '' : 's'}
                    </span>
                    <span className="category-list__actions">
                      <Button variant="ghost" size="sm" onClick={() => setEditingId(c.id)} aria-label={`Edit ${c.name}`}>
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="btn--danger-text"
                        disabled={(c.expenseCount ?? 0) > 0}
                        title={(c.expenseCount ?? 0) > 0 ? 'Reassign or delete its expenses first' : undefined}
                        onClick={() => handleDelete(c)}
                        aria-label={`Delete ${c.name}`}
                      >
                        Delete
                      </Button>
                    </span>
                  </li>
                ),
              )}
            </ul>
          ) : (
            <EmptyState title="No categories yet" description="Add one on the left to start tracking." />
          )}
        </Card>
      </div>
    </>
  );
}
