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

// Purchase Report Types
export interface GoodsReceivedReport {
  supplier: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  receivedDate: string;
  receivedBy: string;
}

export interface PurchaseOrderDetailedReport {
  orderNumber: string;
  date: string;
  status: string;
  supplier: string;
  item: string;
  quantity: number;
  unitPrice: number;
  total: number;
  createdBy?: string;
}

export interface PurchaseOrderSummaryReport {
  orderNumber: string;
  date: string;
  supplier: string;
  status: string;
  total: number;
  createdBy?: string;
}

export interface SupplierReport {
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
}

// Inventory Report Types
export interface InventorySummaryReport {
  itemName: string;
  category: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalValue: number;
  location: string;
}

export interface LowStockReport {
  itemName: string;
  category: string;
  currentQuantity: number;
  minStock: number;
  unit: string;
  status: string;
}

export interface InventoryAdjustmentReport {
  date: string;
  itemName: string;
  adjustmentType: string;
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  reason: string;
  adjustedBy: string;
  notes: string;
}

export interface InventoryRequestReport {
  requestId: string;
  date: string;
  requestedFrom: string;
  requestedBy: string;
  itemName: string;
  quantity: number;
  unit: string;
  status: string;
}

export interface ExpiringBatchReport {
  batchNumber: string;
  itemName: string;
  quantity: number;
  unit: string;
  expiryDate: string;
  daysLeft: number;
}

// Accounting Report Types
export interface ExpenseSummaryReport {
  category: string;
  totalAmount: number;
  count: number;
}

export interface ExpenseDetailedReport {
  date: string;
  description: string;
  category: string;
  amount: number;
  paymentMethod: string;
  createdBy: string;
}

// Profit & Revenue Report Types
export interface RevenueReport {
  date: string;
  revenue: number;
  orderCount: number;
}

export interface GrossProfitReport {
  date: string;
  revenue: number;
  purchases: number;
  grossProfit: number;
}

export interface NetProfitReport {
  date: string;
  revenue: number;
  purchases: number;
  expenses: number;
  grossProfit: number;
  netProfit: number;
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

  // Purchase Reports
  getGoodsReceived: async (params: DateRangeParams): Promise<GoodsReceivedReport[]> => {
    const response = await api.get('/reports/purchases/goods-received', { params });
    return response.data.goodsReceived;
  },

  getPurchaseOrderDetailed: async (params: DateRangeParams): Promise<PurchaseOrderDetailedReport[]> => {
    const response = await api.get('/reports/purchases/order-detailed', { params });
    return response.data.purchaseOrders;
  },

  getPurchaseOrderSummary: async (params: DateRangeParams): Promise<PurchaseOrderSummaryReport[]> => {
    const response = await api.get('/reports/purchases/order-summary', { params });
    return response.data.purchaseOrders;
  },

  getSuppliersList: async (): Promise<SupplierReport[]> => {
    const response = await api.get('/reports/purchases/suppliers');
    return response.data.suppliers;
  },

  // Inventory Reports
  getInventorySummary: async (): Promise<InventorySummaryReport[]> => {
    const response = await api.get('/reports/inventory/summary');
    return response.data.inventory;
  },

  getLowStock: async (): Promise<LowStockReport[]> => {
    const response = await api.get('/reports/inventory/low-stock');
    return response.data.lowStock;
  },

  getInventoryAdjustments: async (params: DateRangeParams): Promise<InventoryAdjustmentReport[]> => {
    const response = await api.get('/reports/inventory/adjustments', { params });
    return response.data.adjustments;
  },

  getInventoryRequests: async (params: DateRangeParams): Promise<InventoryRequestReport[]> => {
    const response = await api.get('/reports/inventory/requests', { params });
    return response.data.requests;
  },

  getExpiringBatches: async (params: DateRangeParams): Promise<ExpiringBatchReport[]> => {
    const response = await api.get('/reports/inventory/expiring-batches', { params });
    return response.data.batches;
  },

  // Accounting Reports
  getExpenseSummary: async (params: DateRangeParams): Promise<ExpenseSummaryReport[]> => {
    const response = await api.get('/reports/accounting/expenses/summary', { params });
    return response.data.expenses;
  },

  getExpenseDetailed: async (params: DateRangeParams): Promise<ExpenseDetailedReport[]> => {
    const response = await api.get('/reports/accounting/expenses/detailed', { params });
    return response.data.expenses;
  },

  // Profit & Revenue Reports
  getRevenue: async (params: DateRangeParams): Promise<RevenueReport[]> => {
    const response = await api.get('/reports/accounting/revenue', { params });
    return response.data.revenue;
  },

  getGrossProfit: async (params: DateRangeParams): Promise<GrossProfitReport[]> => {
    const response = await api.get('/reports/accounting/gross-profit', { params });
    return response.data.grossProfit;
  },

  getNetProfit: async (params: DateRangeParams): Promise<NetProfitReport[]> => {
    const response = await api.get('/reports/accounting/net-profit', { params });
    return response.data.netProfit;
  },
};