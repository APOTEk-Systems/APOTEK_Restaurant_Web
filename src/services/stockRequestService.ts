import { api } from './api';

export interface StockRequestItem {
  id: number;
  requestId: number;
  itemId: number;
  quantity: number;
  status: string;
  item?: {
    id: number;
    name: string;
    sku?: string;
  };
}

export interface StockRequest {
  id: number;
  requestId: string;
  status: string;
  requestedBy: string | null;
  requestedFrom: string | null;
  requestedAt: string;
  approvedAt: string | null;
  fulfilledAt: string | null;
  notes: string | null;
  requestItems: StockRequestItem[];
}

export interface CreateStockRequestData {
  requestedBy?: string;
  requestedFrom: string;
  requestItems: {
    itemId: number;
    quantity: number;
  }[];
}

export interface UpdateStockRequestStatusData {
  status: 'pending' | 'approved' | 'rejected';
}

export const StockRequestService = {
  // Get all stock requests with optional filters
  getAllStockRequests: async (params?: {
    department?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<StockRequest[]> => {
    const response = await api.get('/stock-request', { params });
    return response.data;
  },

  // Create a new stock request
  createStockRequest: async (data: CreateStockRequestData): Promise<StockRequest> => {
    const response = await api.post('/stock-request', data);
    return response.data;
  },

  // Update stock request status
  updateStockRequestStatus: async (
    id: number,
    data: UpdateStockRequestStatusData
  ): Promise<StockRequest> => {
    const response = await api.patch(`/stock-request/${id}/status`, data);
    return response.data;
  },

  // Get main inventory items (for creating stock requests)
  getMainInventory: async (): Promise<any[]> => {
    const response = await api.get('/inventory-item');
    return response.data;
  },

  // Get inventory items with available stock
  getAvailableInventory: async (): Promise<any[]> => {
    const response = await api.get('/inventory-item');
    // Filter to items with quantity > 0
    return response.data.filter((item: any) => item.quantity > 0);
  },
};