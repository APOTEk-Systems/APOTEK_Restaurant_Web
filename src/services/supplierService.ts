import { api } from './api';

export interface Supplier {
  id: number;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  status?: string;
  rating?: number;
  totalOrders?: number;
  category?: string;
  createdAt?: string;
  updatedAt?: string;
  inventoryCategories?: Array<{
    id: number;
    name: string;
    description?: string;
  }>;
}

export interface CreateSupplierData {
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  categories?: number[];
  status?: string;
}

export interface UpdateSupplierData {
  name?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  categories?: number[];
  status?: string;
}

export const SupplierService = {
  getAllSuppliers: async (): Promise<Supplier[]> => {
    const response = await api.get('/suppliers');
    return response.data;
  },

  getSupplierById: async (id: number): Promise<Supplier> => {
    const response = await api.get(`/suppliers/${id}`);
    return response.data;
  },

  createSupplier: async (data: CreateSupplierData): Promise<Supplier> => {
    const response = await api.post('/suppliers', data);
    return response.data;
  },

  updateSupplier: async (id: number, data: UpdateSupplierData): Promise<Supplier> => {
    const response = await api.patch(`/suppliers/${id}`, data);
    return response.data;
  },

  deleteSupplier: async (id: number): Promise<void> => {
    await api.delete(`/suppliers/${id}`);
  },
};