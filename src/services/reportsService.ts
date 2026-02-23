import { api } from './api';

// Types for report data
export interface OrderSummary {
  orderNumber: number;
  date: string;
  itemCount: number;
  total: number;
  waiter: string;
}

export interface OrderDetailed {
  date: string;
  orderNumber: number;
  item: string;
  quantity: number;
  price: number;
}

export interface PaymentReport {
  orderNumber: number;
  date: string;
  amount: number;
  paymentMethod: string;
  waiter: string;
}

export interface RefundReport {
  orderNumber: number;
  date: string;
  item: string;
  price: number;
  reason: string;
  waiter: string;
}

interface DateRangeParams {
  startDate?: string;
  endDate?: string;
}

export const ReportsService = {
  // Order Summary Report
  getOrderSummary: async (params: DateRangeParams): Promise<OrderSummary[]> => {
    const response = await api.get('/reports/orders/summary', { params });
    return response.data.orders;
  },

  // Order Detailed Report
  getOrderDetailed: async (params: DateRangeParams): Promise<OrderDetailed[]> => {
    const response = await api.get('/reports/orders/detailed', { params });
    return response.data.items;
  },

  // Payments Report
  getPayments: async (params: DateRangeParams): Promise<PaymentReport[]> => {
    const response = await api.get('/reports/orders/payments', { params });
    return response.data.payments;
  },

  // Refunds Report
  getRefunds: async (params: DateRangeParams): Promise<RefundReport[]> => {
    const response = await api.get('/reports/orders/refunds', { params });
    return response.data.refunds;
  },
};