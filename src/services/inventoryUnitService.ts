import { api } from './api';

export interface InventoryUnit {
  id: number;
  name: string;
  type: string;
  symbol?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInventoryUnitData {
  name: string;
  type: string;
  symbol?: string;
  description?: string;
}

export interface UpdateInventoryUnitData {
  name?: string;
  type?: string;
  symbol?: string;
  description?: string;
  isActive?: boolean;
}

export const inventoryUnitService = {
  getAll: async (): Promise<InventoryUnit[]> => {
    const response = await api.get('/inventory-unit');
    return response.data;
  },

  getById: async (id: number): Promise<InventoryUnit> => {
    const response = await api.get(`/inventory-unit/${id}`);
    return response.data;
  },

  create: async (data: CreateInventoryUnitData): Promise<InventoryUnit> => {
    const response = await api.post('/inventory-unit', data);
    return response.data;
  },

  update: async (id: number, data: UpdateInventoryUnitData): Promise<InventoryUnit> => {
    const response = await api.patch(`/inventory-unit/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/inventory-unit/${id}`);
  },
};