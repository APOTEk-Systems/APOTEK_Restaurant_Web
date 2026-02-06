import { api } from './api';

export interface InventoryAdjustment {
  id: number;
  adjustmentNumber: string;
  inventoryItemId: number;
  inventoryItem?: {
    id: number;
    name: string;
    unit: string;
  };
  batchId?: number;
  batch?: {
    id: number;
    batchNumber: string;
    expiryDate?: string;
  };
  adjustmentReasonId: number;
  adjustmentReason?: {
    id: number;
    name: string;
  };
  adjustmentType: 'increase' | 'decrease';
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  notes?: string;
  adjustedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export const inventoryAdjustmentService = {
  getAllInventoryAdjustments: async (filters?: {
    inventoryItemId?: number;
    batchId?: number;
    fromDate?: string;
    toDate?: string;
  }): Promise<InventoryAdjustment[]> => {
    const params = new URLSearchParams();
    if (filters?.inventoryItemId) {
      params.append('inventoryItemId', String(filters.inventoryItemId));
    }
    if (filters?.batchId) {
      params.append('batchId', String(filters.batchId));
    }
    if (filters?.fromDate) {
      params.append('fromDate', filters.fromDate);
    }
    if (filters?.toDate) {
      params.append('toDate', filters.toDate);
    }
    const queryString = params.toString();
    const url = queryString ? `/inventory-adjustments?${queryString}` : '/inventory-adjustments';
    const response = await api.get(url);
    return response.data;
  },

  getInventoryAdjustmentById: async (id: number): Promise<InventoryAdjustment> => {
    const response = await api.get(`/inventory-adjustments/${id}`);
    return response.data;
  },

  createInventoryAdjustment: async (data: {
    inventoryItemId: number;
    adjustmentReasonId: number;
    adjustmentType: 'increase' | 'decrease';
    quantity: number;
    batchId?: number;
    notes?: string;
    adjustedBy?: string;
  }): Promise<InventoryAdjustment> => {
    const response = await api.post('/inventory-adjustments', data);
    return response.data;
  },
};