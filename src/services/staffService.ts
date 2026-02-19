import { api } from './api';

export interface Department {
  id: number;
  name: string;
  description?: string;
}

export interface StaffRole {
  id: number;
  name: string;
  description?: string;
  departmentId?: number;
  department?: Department;
}

export interface Staff {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  roleId?: number;
  role?: StaffRole;
  departmentId?: number;
  department?: Department;
  hireDate: string;
  status: string;
  imageUrl?: string;
  address?: string;
  emergencyContact?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateStaffData {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  roleId?: number;
  departmentId?: number;
  hireDate: string;
  status?: string;
  imageUrl?: string;
  address?: string;
  emergencyContact?: string;
  notes?: string;
}

export const staffService = {
  getAll: async (): Promise<Staff[]> => {
    const response = await api.get('/staff');
    return response.data;
  },

  getById: async (id: number): Promise<Staff> => {
    const response = await api.get(`/staff/${id}`);
    return response.data;
  },

  create: async (data: CreateStaffData): Promise<Staff> => {
    const response = await api.post('/staff', data);
    return response.data;
  },

  update: async (id: number, data: Partial<CreateStaffData>): Promise<Staff> => {
    const response = await api.put(`/staff/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/staff/${id}`);
  },

  uploadImage: async (file: File): Promise<{ imageUrl: string }> => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post('/staff/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};