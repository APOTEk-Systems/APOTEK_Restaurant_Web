import { api } from './api';

export interface StaffRole {
  id: number;
  name: string;
  description?: string;
  departmentId?: number;
  department?: {
    id: number;
    name: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStaffRoleData {
  name: string;
  description?: string;
  departmentId?: number;
}

export const staffRoleService = {
  getAll: async (): Promise<StaffRole[]> => {
    const response = await api.get('/staff-roles');
    return response.data;
  },

  getById: async (id: number): Promise<StaffRole> => {
    const response = await api.get(`/staff-roles/${id}`);
    return response.data;
  },

  getByDepartment: async (departmentId: number): Promise<StaffRole[]> => {
    const response = await api.get(`/staff-roles/department/${departmentId}`);
    return response.data;
  },

  create: async (data: CreateStaffRoleData): Promise<StaffRole> => {
    const response = await api.post('/staff-roles', data);
    return response.data;
  },

  update: async (id: number, data: Partial<CreateStaffRoleData>): Promise<StaffRole> => {
    const response = await api.put(`/staff-roles/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/staff-roles/${id}`);
  },
};