import { api } from './api';

interface Table {
  id: number;
  number: number;
  capacity: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export const TableService = {
  getAllTables: async (): Promise<Table[]> => {
    const response = await api.get('/tables');
    return response.data;
  },

  getTableById: async (id: number): Promise<Table> => {
    const response = await api.get(`/tables/${id}`);
    return response.data;
  },

  createTable: async (tableData: Omit<Table, 'id' | 'createdAt' | 'updatedAt'>): Promise<Table> => {
    const response = await api.post('/tables', tableData);
    return response.data;
  },

  updateTable: async (id: number, tableData: Partial<Table>): Promise<Table> => {
    const response = await api.patch(`/tables/${id}`, tableData);
    return response.data;
  },

  deleteTable: async (id: number): Promise<void> => {
    await api.delete(`/tables/${id}`);
  },
};