import { api } from './api';

export interface UserGroup {
  id: number;
  name: string;
  description?: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  permissions?: UserGroupPermission[];
  _count?: { users: number };
}

export interface UserGroupPermission {
  id: number;
  permissionId: number;
  userGroupId: number;
  permission: Permission;
}

export interface Permission {
  id: number;
  name: string;
  description?: string;
  category: string;
  isActive: boolean;
}

export interface CreateUserGroupData {
  name: string;
  description?: string;
  isDefault?: boolean;
  permissionIds?: number[];
}

export const userGroupService = {
  getAll: async (): Promise<UserGroup[]> => {
    const response = await api.get('/user-groups');
    return response.data;
  },

  getById: async (id: number): Promise<UserGroup> => {
    const response = await api.get(`/user-groups/${id}`);
    return response.data;
  },

  create: async (data: CreateUserGroupData): Promise<UserGroup> => {
    const response = await api.post('/user-groups', data);
    return response.data;
  },

  update: async (id: number, data: Partial<CreateUserGroupData>): Promise<UserGroup> => {
    const response = await api.put(`/user-groups/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/user-groups/${id}`);
  },

  setDefault: async (id: number): Promise<UserGroup> => {
    const response = await api.post(`/user-groups/${id}/set-default`);
    return response.data;
  },
};