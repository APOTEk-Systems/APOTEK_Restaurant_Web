import { api } from "./api";

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
  receivedAt?: string;
  expiryDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const batchService = {
  getAllBatches: async (): Promise<Batch[]> => {
    const response = await api.get("/batches");
    return response.data;
  },

  getBatchById: async (id: number): Promise<Batch> => {
    const response = await api.get(`/batches/${id}`);
    return response.data;
  },

  getBatchesByItem: async (itemId: number): Promise<Batch[]> => {
    const response = await api.get(`/batches/item/${itemId}`);
    return response.data;
  },

  getExpiringBatches: async (days: number = 10): Promise<Batch[]> => {
    const response = await api.get(`/batches/expiring?days=${days}`);
    return response.data;
  },

  createBatch: async (data: Partial<Batch>): Promise<Batch> => {
    const response = await api.post("/batches", data);
    return response.data;
  },

  updateBatch: async (id: number, data: Partial<Batch>): Promise<Batch> => {
    const response = await api.put(`/batches/${id}`, data);
    return response.data;
  },

  deleteBatch: async (id: number): Promise<void> => {
    await api.delete(`/batches/${id}`);
  },
};