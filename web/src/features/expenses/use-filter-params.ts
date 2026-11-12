'use client';

import { useCallback, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { ExpenseFilters } from '@/lib/types';

/** Keeps expense filters in the URL so they survive refreshes and can be shared/bookmarked. */
export function useFilterParams(): [ExpenseFilters, (next: ExpenseFilters) => void] {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const filters = useMemo<ExpenseFilters>(() => {
    const num = (key: string) => {
      const n = Number(params.get(key));
      return Number.isInteger(n) && n > 0 ? n : undefined;
    };
    return {
      search: params.get('search') ?? undefined,
      categoryId: num('categoryId'),
      from: params.get('from') ?? undefined,
      to: params.get('to') ?? undefined,
      page: num('page') ?? 1,
    };
  }, [params]);

  const setFilters = useCallback(
    (next: ExpenseFilters) => {
      const qs = new URLSearchParams();
      Object.entries(next).forEach(([k, v]) => {
        if (v !== undefined && v !== '' && !(k === 'page' && v === 1)) qs.set(k, String(v));
      });
      const query = qs.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [router, pathname],
  );

  return [filters, setFilters];
}
