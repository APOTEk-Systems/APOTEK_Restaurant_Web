import { api } from './api';

export type DissatisfactionStatus = 'PENDING' | 'REMADE' | 'RESOLVED' | 'REFUNDED';

export interface Dissatisfaction {
  id: number;
  orderId: number;
  tableNumber: number;
  itemName: string;
  reason: string;
  status: DissatisfactionStatus;
  resolution?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDissatisfactionData {
  orderId: number;
  tableNumber: number;
  itemName: string;
  reason: string;
}

export interface UpdateDissatisfactionData extends Partial<CreateDissatisfactionData> {}

export interface UpdateStatusData {
  status: DissatisfactionStatus;
  resolution?: string;
}

export const dissatisfactionService = {
  getAll: async (): Promise<Dissatisfaction[]> => {
    const response = await api.get('/dissatisfactions');
    return response.data;
  },

  getById: async (id: number): Promise<Dissatisfaction> => {
    const response = await api.get(`/dissatisfactions/${id}`);
    return response.data;
  },

  getByStatus: async (status: string): Promise<Dissatisfaction[]> => {
    const response = await api.get(`/dissatisfactions/status?status=${status}`);
    return response.data;
  },

  create: async (data: CreateDissatisfactionData): Promise<Dissatisfaction> => {
    const response = await api.post('/dissatisfactions', data);
    return response.data;
  },

  update: async (id: number, data: UpdateDissatisfactionData): Promise<Dissatisfaction> => {
    const response = await api.put(`/dissatisfactions/${id}`, data);
    return response.data;
  },

  updateStatus: async (id: number, data: UpdateStatusData): Promise<Dissatisfaction> => {
    const response = await api.patch(`/dissatisfactions/${id}/status`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/dissatisfactions/${id}`);
  },
};