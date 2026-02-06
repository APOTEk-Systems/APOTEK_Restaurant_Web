import { api } from './api';

export interface PurchaseOrderItem {
  id?: number;
  inventoryItemId: number;
  inventoryItem?: {
    id: number;
    name: string;
    unit: string;
  };
  quantityOrdered: number;
  quantityReceived?: number;
  unitPrice: number;
}

export interface PurchaseOrder {
  id: number;
  poNumber: string;
  supplierId: number;
  supplier?: {
    id: number;
    name: string;
  };
  status: 'PENDING' | 'APPROVED' | 'ORDERED' | 'PARTIALLY_RECEIVED' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  orderedAt?: string;
  expectedDeliveryAt?: string;
  createdAt: string;
  updatedAt: string;
  items: PurchaseOrderItem[];
}

export interface CreatePurchaseOrderData {
  poNumber?: string;
  supplierId: number;
  notes?: string;
  expectedDeliveryAt?: string;
  items: Array<{
    inventoryItemId: number;
    quantityOrdered: number;
    unitPrice: number;
  }>;
}

export interface UpdatePurchaseOrderData {
  poNumber?: string;
  supplierId?: number;
  status?: string;
  notes?: string;
  expectedDeliveryAt?: string;
  items?: Array<{
    inventoryItemId: number;
    quantityOrdered: number;
    unitPrice: number;
  }>;
}

export const purchaseOrderService = {
  getAllPurchaseOrders: async (): Promise<PurchaseOrder[]> => {
    const response = await api.get('/purchase-orders');
    return response.data;
  },

  getPurchaseOrderById: async (id: number): Promise<PurchaseOrder> => {
    const response = await api.get(`/purchase-orders/${id}`);
    return response.data;
  },

  createPurchaseOrder: async (data: CreatePurchaseOrderData): Promise<PurchaseOrder> => {
    const response = await api.post('/purchase-orders', data);
    return response.data;
  },

  updatePurchaseOrder: async (id: number, data: UpdatePurchaseOrderData): Promise<PurchaseOrder> => {
    const response = await api.patch(`/purchase-orders/${id}`, data);
    return response.data;
  },

  deletePurchaseOrder: async (id: number): Promise<void> => {
    await api.delete(`/purchase-orders/${id}`);
  },

  approvePurchaseOrder: async (id: number): Promise<PurchaseOrder> => {
    const response = await api.post(`/purchase-orders/${id}/approve`);
    return response.data;
  },

  rejectPurchaseOrder: async (id: number, reason?: string): Promise<PurchaseOrder> => {
    const response = await api.post(`/purchase-orders/${id}/reject`, { reason });
    return response.data;
  },

  markPartiallyReceived: async (id: number): Promise<PurchaseOrder> => {
    const response = await api.post(`/purchase-orders/${id}/partially-received`);
    return response.data;
  },

  markCompleted: async (id: number): Promise<PurchaseOrder> => {
    const response = await api.post(`/purchase-orders/${id}/complete`);
    return response.data;
  },
};