import { api } from './api';

interface InventoryItem {
  id: number;
  name: string;
  description: string | null;
  sku: string | null;
  categoryId: number;
  unit: string;
  quantity: number;
  minStock: number;
  maxStock: number;
  price: number;
  supplier: string | null;
  storageLocation: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: number;
    name: string;
    description: string;
    isActive: boolean;
  };
}

interface InventoryCategory {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  supplierId: number | null;
  createdAt: string;
  updatedAt: string;
}

interface InventoryUnit {
  id: number;
  name: string;
  type: string;
  symbol: string | null;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Supplier {
  id: number;
  name: string;
  contactPerson: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  createdAt: string;
  updatedAt: string;
  inventoryCategories: InventoryCategory[];
}

// Export types for use in components
export type { InventoryItem, InventoryCategory, InventoryUnit, Supplier };

export const InventoryService = {
  // Inventory Items
  getAllInventoryItems: async (): Promise<InventoryItem[]> => {
    const response = await api.get('/inventory-item');
    return response.data;
  },

  getInventoryItemById: async (id: number): Promise<InventoryItem> => {
    const response = await api.get(`/inventory-item/${id}`);
    return response.data;
  },

  createInventoryItem: async (itemData: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<InventoryItem> => {
    const response = await api.post('/inventory-item', itemData);
    return response.data;
  },

  updateInventoryItem: async (id: number, itemData: Partial<InventoryItem>): Promise<InventoryItem> => {
    const response = await api.patch(`/inventory-item/${id}`, itemData);
    return response.data;
  },

  deleteInventoryItem: async (id: number): Promise<void> => {
    await api.delete(`/inventory-item/${id}`);
  },

  // Inventory Categories
  getAllInventoryCategories: async (): Promise<InventoryCategory[]> => {
    const response = await api.get('/inventory-category');
    return response.data;
  },

  getInventoryCategoryById: async (id: number): Promise<InventoryCategory> => {
    const response = await api.get(`/inventory-category/${id}`);
    return response.data;
  },

  createInventoryCategory: async (categoryData: Omit<InventoryCategory, 'id' | 'createdAt' | 'updatedAt'>): Promise<InventoryCategory> => {
    const response = await api.post('/inventory-category', categoryData);
    return response.data;
  },

  updateInventoryCategory: async (id: number, categoryData: Partial<InventoryCategory>): Promise<InventoryCategory> => {
    const response = await api.patch(`/inventory-category/${id}`, categoryData);
    return response.data;
  },

  deleteInventoryCategory: async (id: number): Promise<void> => {
    await api.delete(`/inventory-category/${id}`);
  },

  // Inventory Units
  getAllInventoryUnits: async (): Promise<InventoryUnit[]> => {
    const response = await api.get('/inventory-unit');
    return response.data;
  },

  getInventoryUnitById: async (id: number): Promise<InventoryUnit> => {
    const response = await api.get(`/inventory-unit/${id}`);
    return response.data;
  },

  createInventoryUnit: async (unitData: Omit<InventoryUnit, 'id' | 'createdAt' | 'updatedAt'>): Promise<InventoryUnit> => {
    const response = await api.post('/inventory-unit', unitData);
    return response.data;
  },

  updateInventoryUnit: async (id: number, unitData: Partial<InventoryUnit>): Promise<InventoryUnit> => {
    const response = await api.patch(`/inventory-unit/${id}`, unitData);
    return response.data;
  },

  deleteInventoryUnit: async (id: number): Promise<void> => {
    await api.delete(`/inventory-unit/${id}`);
  },

  // Suppliers
  getAllSuppliers: async (): Promise<Supplier[]> => {
    const response = await api.get('/suppliers');
    return response.data;
  },

  getSupplierById: async (id: number): Promise<Supplier> => {
    const response = await api.get(`/suppliers/${id}`);
    return response.data;
  },

  createSupplier: async (supplierData: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt' | 'inventoryCategories'>): Promise<Supplier> => {
    const response = await api.post('/suppliers', supplierData);
    return response.data;
  },

  updateSupplier: async (id: number, supplierData: Partial<Supplier>): Promise<Supplier> => {
    const response = await api.patch(`/suppliers/${id}`, supplierData);
    return response.data;
  },

  deleteSupplier: async (id: number): Promise<void> => {
    await api.delete(`/suppliers/${id}`);
  },
};