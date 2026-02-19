import { api } from './api';

export type BarReturnStatus = 'PENDING' | 'REMADE' | 'RESOLVED' | 'REFUNDED';

export interface BarReturn {
  id: number;
  orderId: number;
  tableNumber: number;
  itemName: string;
  reason: string;
  status: BarReturnStatus;
  resolution?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBarReturnData {
  orderId: number;
  tableNumber: number;
  itemName: string;
  reason: string;
}

export interface UpdateBarReturnData extends Partial<CreateBarReturnData> {}

export interface UpdateStatusData {
  status: BarReturnStatus;
  resolution?: string;
}

export const barReturnService = {
  getAll: async (): Promise<BarReturn[]> => {
    const response = await api.get('/bar-returns');
    return response.data;
  },

  getById: async (id: number): Promise<BarReturn> => {
    const response = await api.get(`/bar-returns/${id}`);
    return response.data;
  },

  getByStatus: async (status: string): Promise<BarReturn[]> => {
    const response = await api.get(`/bar-returns/status?status=${status}`);
    return response.data;
  },

  create: async (data: CreateBarReturnData): Promise<BarReturn> => {
    const response = await api.post('/bar-returns', data);
    return response.data;
  },

  update: async (id: number, data: UpdateBarReturnData): Promise<BarReturn> => {
    const response = await api.put(`/bar-returns/${id}`, data);
    return response.data;
  },

  updateStatus: async (id: number, data: UpdateStatusData): Promise<BarReturn> => {
    const response = await api.patch(`/bar-returns/${id}/status`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/bar-returns/${id}`);
  },
};