import { api } from './api';
import { User } from './userService';

export interface Expense {
  id: number;
  amount: number;
  date: string;
  description: string | null;
  paymentMethod: string | null;
  categoryId: number;
  category: {
    id: number;
    name: string;
  };
  createdBy:User,
  updatedBy:User,
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseCategory {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpenseData {
  amount: number;
  date: string;
  description?: string;
  categoryId: number;
  paymentMethod?: string;
}

export interface UpdateExpenseData {
  amount?: number;
  date?: string;
  description?: string;
  categoryId?: number;
  paymentMethod?: string;
}

interface GetExpensesParams {
  startDate?: string;
  endDate?: string;
  categoryId?: number;
}

export const ExpenseService = {
  // Expenses
  getAllExpenses: async (params?: GetExpensesParams): Promise<Expense[]> => {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.categoryId) queryParams.append('categoryId', params.categoryId.toString());
    
    const response = await api.get(`/expenses?${queryParams.toString()}`);
    return response.data;
  },

  getExpenseById: async (id: number): Promise<Expense> => {
    const response = await api.get(`/expenses/${id}`);
    return response.data;
  },

  createExpense: async (data: CreateExpenseData): Promise<Expense> => {
    const response = await api.post('/expenses', data);
    return response.data;
  },

  updateExpense: async (id: number, data: UpdateExpenseData): Promise<Expense> => {
    const response = await api.patch(`/expenses/${id}`, data);
    return response.data;
  },

  deleteExpense: async (id: number): Promise<void> => {
    await api.delete(`/expenses/${id}`);
  },

  // Expense Categories (separate endpoint)
  getAllCategories: async (): Promise<ExpenseCategory[]> => {
    const response = await api.get('/expense-categories');
    return response.data;
  },

  getCategoryById: async (id: number): Promise<ExpenseCategory> => {
    const response = await api.get(`/expense-categories/${id}`);
    return response.data;
  },

  createCategory: async (data: { name: string; description?: string }): Promise<ExpenseCategory> => {
    const response = await api.post('/expense-categories', data);
    return response.data;
  },

  updateCategory: async (id: number, data: { name?: string; description?: string }): Promise<ExpenseCategory> => {
    const response = await api.patch(`/expense-categories/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id: number): Promise<void> => {
    await api.delete(`/expense-categories/${id}`);
  },
};