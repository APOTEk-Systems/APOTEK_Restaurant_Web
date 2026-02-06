import { api } from './api';

export interface AdjustmentReason {
  id: number;
  name: string;
  type: 'increase' | 'decrease' | 'both';
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const adjustmentReasonService = {
  getAllAdjustmentReasons: async (): Promise<AdjustmentReason[]> => {
    const response = await api.get('/adjustment-reasons');
    return response.data;
  },

  getAdjustmentReasonById: async (id: number): Promise<AdjustmentReason> => {
    const response = await api.get(`/adjustment-reasons/${id}`);
    return response.data;
  },

  createAdjustmentReason: async (data: {
    name: string;
    type: 'increase' | 'decrease' | 'both';
    description?: string;
  }): Promise<AdjustmentReason> => {
    const response = await api.post('/adjustment-reasons', data);
    return response.data;
  },

  updateAdjustmentReason: async (id: number, data: Partial<{
    name: string;
    type: 'increase' | 'decrease' | 'both';
    description: string;
    isActive: boolean;
  }>): Promise<AdjustmentReason> => {
    const response = await api.patch(`/adjustment-reasons/${id}`, data);
    return response.data;
  },

  deleteAdjustmentReason: async (id: number): Promise<void> => {
    await api.delete(`/adjustment-reasons/${id}`);
  },
};