import { api } from './api';

export interface User {
  id: number;
  username: string;
  email?: string;
  staffId?: number;
  userGroupId?: number;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  staff?: {
    id: number;
    firstName: string;
    lastName: string;
  };
  userGroup?: {
    id: number;
    name: string;
  };
  permissionOverrides?: PermissionOverride[];
}

export interface PermissionOverride {
  id: number;
  userId: number;
  permissionId: number;
  allowed: boolean;
  permission: {
    id: number;
    name: string;
    description: string;
    category: string;
  };
}

export interface CreateUserData {
  username: string;
  email?: string;
  password: string;
  staffId?: number;
  userGroupId?: number;
}

export interface UpdateUserData {
  username?: string;
  email?: string;
  password?: string;
  staffId?: number | null;
  userGroupId?: number | null;
  isActive?: boolean;
  permissionOverrides?: { permissionId: number; allowed: boolean }[];
}

export const userService = {
  getAll: async (): Promise<User[]> => {
    const response = await api.get('/users');
    return response.data;
  },

  getById: async (id: number): Promise<User> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  create: async (data: CreateUserData): Promise<User> => {
    const response = await api.post('/users', data);
    return response.data;
  },

  update: async (id: number, data: UpdateUserData): Promise<User> => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`);
  },

  changePassword: async (id: number, newPassword: string): Promise<void> => {
    await api.post(`/users/${id}/change-password`, { newPassword });
  },

  getEffectivePermissions: async (id: number): Promise<string[]> => {
    const response = await api.get(`/users/${id}/permissions`);
    return response.data;
  },

  updatePermission: async (userId: number, permissionId: number, allowed: boolean): Promise<void> => {
    await api.put(`/users/${userId}/permissions/${permissionId}`, { allowed });
  },
};