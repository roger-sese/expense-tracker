import type { ExpenseFilters } from './types';

/** Centralised React Query keys so invalidation stays consistent. */
export const queryKeys = {
  me: ['me'] as const,
  categories: ['categories'] as const,
  expenses: {
    all: ['expenses'] as const,
    list: (filters: ExpenseFilters) => ['expenses', 'list', filters] as const,
    detail: (id: number) => ['expenses', 'detail', id] as const,
    summary: (month: string) => ['expenses', 'summary', month] as const,
  },
};
