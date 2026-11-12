import { apiRequest } from './api-client';
import type {
  AuthResponse,
  Category,
  Expense,
  ExpenseFilters,
  ExpenseInput,
  MonthlySummary,
  Paginated,
  User,
} from './types';

/** Typed endpoints, grouped by resource. Components never call fetch directly. */
export const api = {
  auth: {
    login: (email: string, password: string) =>
      apiRequest<AuthResponse>('/auth/login', { method: 'POST', body: { email, password } }),
    register: (name: string, email: string, password: string) =>
      apiRequest<AuthResponse>('/auth/register', { method: 'POST', body: { name, email, password } }),
    me: () => apiRequest<User>('/auth/me'),
  },
  categories: {
    list: () => apiRequest<Category[]>('/categories'),
    create: (data: Pick<Category, 'name' | 'color'>) =>
      apiRequest<Category>('/categories', { method: 'POST', body: data }),
    update: (id: number, data: Partial<Pick<Category, 'name' | 'color'>>) =>
      apiRequest<Category>(`/categories/${id}`, { method: 'PATCH', body: data }),
    remove: (id: number) => apiRequest<void>(`/categories/${id}`, { method: 'DELETE' }),
  },
  expenses: {
    list: (filters: ExpenseFilters = {}) =>
      apiRequest<Paginated<Expense>>('/expenses', { query: { ...filters } }),
    get: (id: number) => apiRequest<Expense>(`/expenses/${id}`),
    create: (data: ExpenseInput) => apiRequest<Expense>('/expenses', { method: 'POST', body: data }),
    update: (id: number, data: Partial<ExpenseInput>) =>
      apiRequest<Expense>(`/expenses/${id}`, { method: 'PATCH', body: data }),
    remove: (id: number) => apiRequest<void>(`/expenses/${id}`, { method: 'DELETE' }),
    summary: (month?: string) => apiRequest<MonthlySummary>('/expenses/summary', { query: { month } }),
  },
};
