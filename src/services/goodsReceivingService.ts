import { api } from './api';

export interface GoodsReceivingItem {
  id?: number;
  inventoryItemId: number;
  inventoryItem?: {
    id: number;
    name: string;
    unit: string;
  };
  batch?: {
    id: number;
    batchNumber: string;
    expiryDate?: string;
  };
  quantityReceived: number;
}

export interface GoodsReceiving {
  id: number;
  grnNumber: string;
  purchaseOrderId?: number;
  purchaseOrder?: {
    id: number;
    poNumber: string;
  };
  supplierId: number;
  supplier?: {
    id: number;
    name: string;
  };
  receivedAt: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  receivedItems: GoodsReceivingItem[];
}

export interface CreateGoodsReceivingData {
  grnNumber?: string;
  purchaseOrderId?: number;
  supplierId: number;
  notes?: string;
  receivedAt?: string;
  receivedItems: Array<{
    inventoryItemId: number;
    quantityReceived: number;
    batchNumber?: string;
    expiryDate?: string;
  }>;
}

export const goodsReceivingService = {
  getAllGoodsReceiving: async (): Promise<GoodsReceiving[]> => {
    const response = await api.get('/goods-receiving');
    return response.data;
  },

  getGoodsReceivingById: async (id: number): Promise<GoodsReceiving> => {
    const response = await api.get(`/goods-receiving/${id}`);
    return response.data;
  },

  createGoodsReceiving: async (data: CreateGoodsReceivingData): Promise<GoodsReceiving> => {
    const response = await api.post('/goods-receiving', data);
    return response.data;
  },

  updateGoodsReceiving: async (id: number, data: Partial<CreateGoodsReceivingData>): Promise<GoodsReceiving> => {
    const response = await api.patch(`/goods-receiving/${id}`, data);
    return response.data;
  },

  deleteGoodsReceiving: async (id: number): Promise<void> => {
    await api.delete(`/goods-receiving/${id}`);
  },

  getGoodsReceivingByPurchaseOrderId: async (purchaseOrderId: number): Promise<GoodsReceiving[]> => {
    const response = await api.get(`/goods-receiving/po/${purchaseOrderId}`);
    return response.data;
  },
};