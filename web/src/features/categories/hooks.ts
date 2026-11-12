'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';
import type { Category } from '@/lib/types';

export const useCategories = () => useQuery({ queryKey: queryKeys.categories, queryFn: api.categories.list });

function useInvalidateCategories() {
  const qc = useQueryClient();
  return () => {
    void qc.invalidateQueries({ queryKey: queryKeys.categories });
    // Category name/colour appears on expenses and in the summary too.
    void qc.invalidateQueries({ queryKey: queryKeys.expenses.all });
  };
}

export function useCreateCategory() {
  const onSuccess = useInvalidateCategories();
  return useMutation({ mutationFn: api.categories.create, onSuccess });
}

export function useUpdateCategory() {
  const onSuccess = useInvalidateCategories();
  return useMutation({
    mutationFn: ({ id, ...data }: Pick<Category, 'id'> & Partial<Pick<Category, 'name' | 'color'>>) =>
      api.categories.update(id, data),
    onSuccess,
  });
}

export function useDeleteCategory() {
  const onSuccess = useInvalidateCategories();
  return useMutation({ mutationFn: api.categories.remove, onSuccess });
}
