'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';
import type { ExpenseFilters, ExpenseInput } from '@/lib/types';

export const useExpenses = (filters: ExpenseFilters) =>
  useQuery({
    queryKey: queryKeys.expenses.list(filters),
    queryFn: () => api.expenses.list(filters),
    placeholderData: keepPreviousData,
  });

export const useExpense = (id: number) =>
  useQuery({
    queryKey: queryKeys.expenses.detail(id),
    queryFn: () => api.expenses.get(id),
    enabled: Number.isInteger(id) && id > 0,
  });

export const useMonthlySummary = (month: string) =>
  useQuery({
    queryKey: queryKeys.expenses.summary(month),
    queryFn: () => api.expenses.summary(month),
    placeholderData: keepPreviousData,
  });

function useInvalidateExpenses() {
  const qc = useQueryClient();
  return () => {
    void qc.invalidateQueries({ queryKey: queryKeys.expenses.all });
    void qc.invalidateQueries({ queryKey: queryKeys.categories }); // expense counts
  };
}

export function useCreateExpense() {
  const onSuccess = useInvalidateExpenses();
  return useMutation({ mutationFn: api.expenses.create, onSuccess });
}

export function useUpdateExpense(id: number) {
  const onSuccess = useInvalidateExpenses();
  return useMutation({ mutationFn: (data: Partial<ExpenseInput>) => api.expenses.update(id, data), onSuccess });
}

export function useDeleteExpense() {
  const onSuccess = useInvalidateExpenses();
  return useMutation({ mutationFn: api.expenses.remove, onSuccess });
}
