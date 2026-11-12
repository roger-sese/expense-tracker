'use client';

import { useEffect, useState } from 'react';
import { Button, SelectField, TextField } from '@/components/ui';
import type { Category, ExpenseFilters as Filters } from '@/lib/types';

interface ExpenseFiltersProps {
  value: Filters;
  categories: Category[];
  onChange: (next: Filters) => void;
}

export function ExpenseFilters({ value, categories, onChange }: ExpenseFiltersProps) {
  // Debounce the free-text search so we don't query on every keystroke.
  const [search, setSearch] = useState(value.search ?? '');
  useEffect(() => setSearch(value.search ?? ''), [value.search]);
  useEffect(() => {
    if (search === (value.search ?? '')) return;
    const t = setTimeout(() => onChange({ ...value, search: search || undefined, page: 1 }), 300);
    return () => clearTimeout(t);
  }, [search, value, onChange]);

  const update = (patch: Partial<Filters>) => onChange({ ...value, ...patch, page: 1 });
  const hasFilters = Boolean(value.search || value.categoryId || value.from || value.to);

  return (
    <div className="filters" role="search">
      <TextField label="Search" placeholder="Description…" value={search} onChange={(e) => setSearch(e.target.value)} />
      <SelectField
        label="Category"
        value={value.categoryId ?? ''}
        onChange={(e) => update({ categoryId: e.target.value ? Number(e.target.value) : undefined })}
      >
        <option value="">All categories</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </SelectField>
      <TextField label="From" type="date" value={value.from ?? ''} onChange={(e) => update({ from: e.target.value || undefined })} />
      <TextField label="To" type="date" value={value.to ?? ''} onChange={(e) => update({ to: e.target.value || undefined })} />
      {hasFilters && (
        <Button variant="ghost" className="filters__clear" onClick={() => onChange({ page: 1 })}>
          Clear
        </Button>
      )}
    </div>
  );
}
