import { api } from './api';

export interface AccountingSummary {
  totalRevenue: number;
  totalExpenses: number;
  totalPurchases: number;
  netProfit: number;
  revenueChange: number;
  expenseChange: number;
  purchaseChange: number;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
}

export interface DailySummary {
  date: string;
  revenue: number;
  expenses: number;
  purchases: number;
}

export interface ExpenseBreakdown {
  category: string;
  amount: number;
  percentage: number;
}

export const accountingService = {
  getSummary: async (startDate?: string, endDate?: string): Promise<AccountingSummary> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const response = await api.get(`/accounting/summary?${params.toString()}`);
    return response.data;
  },

  getTransactions: async (limit: number = 10): Promise<Transaction[]> => {
    const response = await api.get(`/accounting/transactions?limit=${limit}`);
    return response.data;
  },

  getDailySummary: async (days: number = 30): Promise<DailySummary[]> => {
    const response = await api.get(`/accounting/daily?days=${days}`);
    return response.data;
  },

  getExpenseBreakdown: async (startDate?: string, endDate?: string): Promise<ExpenseBreakdown[]> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const response = await api.get(`/accounting/expenses/breakdown?${params.toString()}`);
    return response.data;
  },
};