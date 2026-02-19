import { api } from './api';

export interface Department {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDepartmentData {
  name: string;
  description?: string;
}

export const departmentService = {
  getAll: async (): Promise<Department[]> => {
    const response = await api.get('/departments');
    return response.data;
  },

  getById: async (id: number): Promise<Department> => {
    const response = await api.get(`/departments/${id}`);
    return response.data;
  },

  create: async (data: CreateDepartmentData): Promise<Department> => {
    const response = await api.post('/departments', data);
    return response.data;
  },

  update: async (id: number, data: Partial<CreateDepartmentData>): Promise<Department> => {
    const response = await api.put(`/departments/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/departments/${id}`);
  },
};