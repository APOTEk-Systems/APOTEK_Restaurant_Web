import { api } from './api';

export interface Table {
  id: number;
  number: number;
  capacity: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED';
  createdAt: string;
  updatedAt: string;
}

export interface CreateTableData {
  number: number;
  capacity: number;
  status?: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED';
}

export interface UpdateTableData {
  number?: number;
  capacity?: number;
  status?: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED';
}

const tableServiceObj = {
  getAll: async (): Promise<Table[]> => {
    const response = await api.get('/tables');
    return response.data;
  },

  getAllTables: async (): Promise<Table[]> => {
    const response = await api.get('/tables');
    return response.data;
  },

  getById: async (id: number): Promise<Table> => {
    const response = await api.get(`/tables/${id}`);
    return response.data;
  },

  create: async (data: CreateTableData): Promise<Table> => {
    const response = await api.post('/tables', data);
    return response.data;
  },

  update: async (id: number, data: UpdateTableData): Promise<Table> => {
    const response = await api.patch(`/tables/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/tables/${id}`);
  },
};

// Export both lowercase and PascalCase for backward compatibility
export const tableService = tableServiceObj;
export const TableService = tableServiceObj;