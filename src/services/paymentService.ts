import { api } from './api';

export type PaymentMethod = 'CASH' | 'CRDB' | 'MPESA' | 'CARD' | 'ONLINE';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export interface Payment {
  id: number;
  orderId: number;
  amount: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  transactionId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderPaymentSummary {
  orderId: number;
  totalAmount: number;
  amountPaid: number;
  remainingAmount: number;
  isFullyPaid: boolean;
  payments: Payment[];
}

export interface CreatePaymentData {
  orderId: number;
  amount: number;
  paymentMethod: PaymentMethod;
  transactionId?: string;
}

export interface SplitPaymentData {
  orderId: number;
  payments: Array<{
    amount: number;
    paymentMethod: PaymentMethod;
    transactionId?: string;
  }>;
}

export const PaymentService = {
  // Create a single payment
  createPayment: async (paymentData: CreatePaymentData): Promise<Payment> => {
    const response = await api.post('/payments', paymentData);
    return response.data;
  },

  // Process split payment (multiple payment methods)
  processSplitPayment: async (
    orderId: number,
    payments: Array<{ amount: number; paymentMethod: PaymentMethod; transactionId?: string }>
  ): Promise<Payment[]> => {
    const response = await api.post('/payments/split', {
      orderId,
      payments,
    });
    return response.data;
  },

  // Get payment summary for an order
  getOrderPaymentSummary: async (orderId: number): Promise<OrderPaymentSummary> => {
    const response = await api.get(`/payments/order/${orderId}/summary`);
    return response.data;
  },

  // Get all payments for an order
  getPaymentsByOrderId: async (orderId: number): Promise<Payment[]> => {
    const response = await api.get(`/payments/order/${orderId}`);
    return response.data;
  },

  // Get all payments
  getAllPayments: async (): Promise<Payment[]> => {
    const response = await api.get('/payments');
    return response.data;
  },

  // Get a single payment by ID
  getPaymentById: async (id: number): Promise<Payment> => {
    const response = await api.get(`/payments/${id}`);
    return response.data;
  },

  // Refund a payment
  refundPayment: async (id: number): Promise<Payment> => {
    const response = await api.post(`/payments/${id}/refund`);
    return response.data;
  },

  // Process lump sum payment (entire order at once)
  processLumpSum: async (orderId: number, paymentMethod: PaymentMethod, transactionId?: string): Promise<Payment> => {
    const summary = await PaymentService.getOrderPaymentSummary(orderId);
    
    return PaymentService.createPayment({
      orderId,
      amount: summary.totalAmount,
      paymentMethod,
      transactionId,
    });
  },
};