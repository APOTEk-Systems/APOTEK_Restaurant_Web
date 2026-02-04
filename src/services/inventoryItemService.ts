import { api } from './api';

export interface InventoryItem {
  id: number;
  name: string;
  description?: string;
  sku?: string;
  categoryId: number;
  category?: {
    id: number;
    name: string;
    description?: string;
  };
  unit: string;
  quantity: number;
  minStock?: number;
  maxStock?: number;
  price: number;
  supplier?: string;
  location?: string;
  storageLocation?: string;
  status: 'NORMAL' | 'LOW' | 'CRITICAL';
  department: string[];
  createdAt: string;
  updatedAt: string;
}

export const inventoryItemService = {
  getAllInventoryItems: async (): Promise<InventoryItem[]> => {
    const response = await api.get('/inventory-item');
    return response.data;
  },

  getInventoryItemById: async (id: number): Promise<InventoryItem> => {
    const response = await api.get(`/inventory-item/${id}`);
    return response.data;
  },

  createInventoryItem: async (data: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<InventoryItem> => {
    const response = await api.post('/inventory-item', data);
    return response.data;
  },

  updateInventoryItem: async (id: number, data: Partial<InventoryItem>): Promise<InventoryItem> => {
    const response = await api.patch(`/inventory-item/${id}`, data);
    return response.data;
  },

  deleteInventoryItem: async (id: number): Promise<void> => {
    await api.delete(`/inventory-item/${id}`);
  },
};