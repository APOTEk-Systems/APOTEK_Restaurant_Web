import { api } from './api';

export interface Permission {
  id: number;
  name: string;
  description?: string;
  category: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const permissionService = {
  getAll: async (): Promise<Permission[]> => {
    const response = await api.get('/permissions');
    return response.data;
  },

  getById: async (id: number): Promise<Permission> => {
    const response = await api.get(`/permissions/${id}`);
    return response.data;
  },

  getByCategory: async (category: string): Promise<Permission[]> => {
    const response = await api.get(`/permissions/category/${category}`);
    return response.data;
  },

  create: async (data: { name: string; description?: string; category: string }): Promise<Permission> => {
    const response = await api.post('/permissions', data);
    return response.data;
  },

  update: async (id: number, data: Partial<{ name: string; description: string; category: string; isActive: boolean }>): Promise<Permission> => {
    const response = await api.put(`/permissions/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/permissions/${id}`);
  },
};