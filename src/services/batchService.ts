import { api } from './api';

export interface Batch {
  id: number;
  batchNumber: string;
  inventoryItemId: number;
  inventoryItem?: {
    id: number;
    name: string;
    unit: string;
  };
  quantity: number;
  expiryDate?: string;
  receivedDate?: string;
  location?: string;
  status?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBatchData {
  batchNumber: string;
  inventoryItemId: number;
  quantity: number;
  expiryDate?: string;
  receivedDate?: string;
  location?: string;
}

export interface UpdateBatchData {
  batchNumber?: string;
  inventoryItemId?: number;
  quantity?: number;
  expiryDate?: string;
  receivedDate?: string;
  location?: string;
}

export const batchService = {
  getAllBatches: async (): Promise<Batch[]> => {
    const response = await api.get('/batches');
    return response.data;
  },

  getBatchById: async (id: number): Promise<Batch> => {
    const response = await api.get(`/batches/${id}`);
    return response.data;
  },

  getExpiringBatches: async (): Promise<Batch[]> => {
    const response = await api.get('/batches/expiring');
    return response.data;
  },

  createBatch: async (data: CreateBatchData): Promise<Batch> => {
    const response = await api.post('/batches', data);
    return response.data;
  },

  updateBatch: async (id: number, data: UpdateBatchData): Promise<Batch> => {
    const response = await api.patch(`/batches/${id}`, data);
    return response.data;
  },

  deleteBatch: async (id: number): Promise<void> => {
    await api.delete(`/batches/${id}`);
  },
};