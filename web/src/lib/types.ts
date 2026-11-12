export interface User {
  id: number;
  name: string;
  email: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface Category {
  id: number;
  name: string;
  color: string;
  expenseCount?: number;
}

export interface Expense {
  id: number;
  description: string;
  amount: number;
  date: string;
  notes: string | null;
  category: Pick<Category, 'id' | 'name' | 'color'> | null;
}

export interface ExpenseInput {
  description: string;
  amount: number;
  date: string;
  categoryId: number;
  notes?: string;
}

export interface ExpenseFilters {
  search?: string;
  categoryId?: number;
  from?: string;
  to?: string;
  page?: number;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface CategoryTotal {
  categoryId: number;
  name: string;
  color: string;
  total: number;
  count: number;
}

export interface MonthlySummary {
  month: string;
  total: number;
  count: number;
  previousMonthTotal: number;
  byCategory: CategoryTotal[];
  recent: Expense[];
}
