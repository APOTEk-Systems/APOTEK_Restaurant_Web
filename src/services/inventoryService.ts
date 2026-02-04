import { api } from './api';

export interface InventoryCategory {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface InventoryUnit {
  id: number;
  name: string;
  type: string;
  symbol?: string;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface InventoryItem {
  id: number;
  name: string;
  description?: string;
  sku?: string;
  categoryId: number;
  category?: InventoryCategory;
  unit: string;
  department: string[];
  quantity: number;
  minStock?: number;
  maxStock?: number;
  price: number;
  supplier?: string;
  location?: string;
  storageLocation?: string;
  status: 'NORMAL' | 'LOW' | 'CRITICAL';
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateInventoryItemData {
  name: string;
  description?: string;
  sku?: string;
  categoryId: number;
  unit: string;
  department?: string[];
  quantity?: number;
  minStock?: number;
  maxStock?: number;
  price?: number;
  supplier?: string;
  location?: string;
  storageLocation?: string;
}

export interface UpdateInventoryItemData {
  name?: string;
  description?: string;
  sku?: string;
  categoryId?: number;
  unit?: string;
  department?: string[];
  quantity?: number;
  minStock?: number;
  maxStock?: number;
  price?: number;
  supplier?: string;
  location?: string;
  storageLocation?: string;
  status?: 'NORMAL' | 'LOW' | 'CRITICAL';
}

export const InventoryService = {
  // Categories
  getAllCategories: async (): Promise<InventoryCategory[]> => {
    const response = await api.get('/inventory-category');
    return response.data;
  },

  getCategoryById: async (id: number): Promise<InventoryCategory> => {
    const response = await api.get(`/inventory-category/${id}`);
    return response.data;
  },

  createCategory: async (data: Omit<InventoryCategory, 'id' | 'isActive' | 'createdAt' | 'updatedAt'>): Promise<InventoryCategory> => {
    const response = await api.post('/inventory-category', data);
    return response.data;
  },

  updateCategory: async (id: number, data: Partial<InventoryCategory>): Promise<InventoryCategory> => {
    const response = await api.patch(`/inventory-category/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id: number): Promise<void> => {
    await api.delete(`/inventory-category/${id}`);
  },

  // Units
  getAllUnits: async (): Promise<InventoryUnit[]> => {
    const response = await api.get('/inventory-unit');
    return response.data;
  },

  getUnitById: async (id: number): Promise<InventoryUnit> => {
    const response = await api.get(`/inventory-unit/${id}`);
    return response.data;
  },

  createUnit: async (data: Omit<InventoryUnit, 'id' | 'isActive' | 'createdAt' | 'updatedAt'>): Promise<InventoryUnit> => {
    const response = await api.post('/inventory-unit', data);
    return response.data;
  },

  updateUnit: async (id: number, data: Partial<InventoryUnit>): Promise<InventoryUnit> => {
    const response = await api.patch(`/inventory-unit/${id}`, data);
    return response.data;
  },

  deleteUnit: async (id: number): Promise<void> => {
    await api.delete(`/inventory-unit/${id}`);
  },

  // Items
  getAllItems: async (): Promise<InventoryItem[]> => {
    const response = await api.get('/inventory-item');
    return response.data;
  },

  getItemById: async (id: number): Promise<InventoryItem> => {
    const response = await api.get(`/inventory-item/${id}`);
    return response.data;
  },

  createItem: async (data: CreateInventoryItemData): Promise<InventoryItem> => {
    const response = await api.post('/inventory-item', data);
    return response.data;
  },

  updateItem: async (id: number, data: UpdateInventoryItemData): Promise<InventoryItem> => {
    const response = await api.patch(`/inventory-item/${id}`, data);
    return response.data;
  },

  deleteItem: async (id: number): Promise<void> => {
    await api.delete(`/inventory-item/${id}`);
  },
};