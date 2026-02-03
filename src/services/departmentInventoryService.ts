import { api } from './api';

export interface DepartmentInventoryItem {
  id: number;
  name: string;
  categoryName: string | null;
  currentStock: number;
  departmentInventoryId: number | null;
  unit: string;
  department: string;
}

export interface UpdateDepartmentInventoryData {
  quantity: number;
}

export const DepartmentInventoryService = {
  // Get inventory items for a specific department
  getDepartmentInventory: async (department: string): Promise<DepartmentInventoryItem[]> => {
    const response = await api.get('/department-inventory', {
      params: { department },
    });
    return response.data;
  },

  // Update department inventory quantity
  updateDepartmentInventory: async (
    departmentInventoryId: number,
    data: UpdateDepartmentInventoryData
  ): Promise<DepartmentInventoryItem> => {
    const response = await api.patch(`/department-inventory/${departmentInventoryId}`, data);
    return response.data;
  },
};