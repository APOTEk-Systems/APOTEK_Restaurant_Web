import { api } from './api';

export interface ExpenseCategory {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpenseCategoryData {
  name: string;
  description?: string;
}

export interface UpdateExpenseCategoryData {
  name?: string;
  description?: string;
}

export const expenseCategoryService = {
  getAll: async (): Promise<ExpenseCategory[]> => {
    const response = await api.get('/expense-categories');
    return response.data;
  },

  getById: async (id: number): Promise<ExpenseCategory> => {
    const response = await api.get(`/expense-categories/${id}`);
    return response.data;
  },

  create: async (data: CreateExpenseCategoryData): Promise<ExpenseCategory> => {
    const response = await api.post('/expense-categories', data);
    return response.data;
  },

  update: async (id: number, data: UpdateExpenseCategoryData): Promise<ExpenseCategory> => {
    const response = await api.patch(`/expense-categories/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/expense-categories/${id}`);
  },
};