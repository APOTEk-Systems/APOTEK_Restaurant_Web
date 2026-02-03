import { api } from './api';

export type PaymentMethod = 'CASH' | 'CARD' | 'ONLINE';
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

export const PaymentService = {
  // Create a single payment
  createPayment: async (paymentData: CreatePaymentData): Promise<Payment> => {
    const response = await api.post('/payment', paymentData);
    return response.data;
  },

  // Get payment summary for an order
  getOrderPaymentSummary: async (orderId: number): Promise<OrderPaymentSummary> => {
    const response = await api.get(`/payment/order/${orderId}/summary`);
    return response.data;
  },

  // Get all payments for an order
  getPaymentsByOrderId: async (orderId: number): Promise<Payment[]> => {
    const response = await api.get(`/payment/order/${orderId}`);
    return response.data;
  },

  // Get all payments
  getAllPayments: async (): Promise<Payment[]> => {
    const response = await api.get('/payment');
    return response.data;
  },

  // Get a single payment by ID
  getPaymentById: async (id: number): Promise<Payment> => {
    const response = await api.get(`/payment/${id}`);
    return response.data;
  },

  // Refund a payment
  refundPayment: async (id: number): Promise<Payment> => {
    const response = await api.post(`/payment/${id}/refund`);
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

  // Process split payment (multiple payment methods)
  processSplitPayment: async (
    orderId: number,
    payments: Array<{ amount: number; paymentMethod: PaymentMethod; transactionId?: string }>
  ): Promise<Payment[]> => {
    const summary = await PaymentService.getOrderPaymentSummary(orderId);
    const totalPayment = payments.reduce((sum, p) => sum + p.amount, 0);

    if (totalPayment > summary.totalAmount) {
      throw new Error(
        `Total payment amount (${totalPayment}) exceeds order total (${summary.totalAmount})`
      );
    }

    const results: Payment[] = [];
    for (const payment of payments) {
      const result = await PaymentService.createPayment({
        orderId,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        transactionId: payment.transactionId,
      });
      results.push(result);
    }

    return results;
  },
};