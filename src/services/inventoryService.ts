import { api } from './api';
import type {
	InventoryItem,
	DepartmentInventoryItem,
	Department,
	StockRequest,
	CreateStockRequest,
	UpdateStockRequestStatus,
} from '../types/inventory.types';

const getErrorMessage = (error: unknown, defaultMessage: string): string => {
	if (!error) return defaultMessage;
	const err = error as Record<string, unknown>;
	const response = err?.response as Record<string, unknown>;
	if (!response) return defaultMessage;
	const data = response?.data as Record<string, unknown>;
	if (!data) {
		return defaultMessage;
	}

	// Check if there's a validation errors array
	const errors = data?.errors as Array<Record<string, string>>;
	if (Array.isArray(errors) && errors.length > 0) {
		const errorMessages = errors
			.map((e) => e?.message || e?.field || JSON.stringify(e))
			.join(', ');
		return `${data?.message || 'Validation error'}: ${errorMessages}`;
	}

	return String(data?.message || data?.error || defaultMessage);
};

export const InventoryService = {
	// Get all stock requests
	getAllStockRequests: async (): Promise<StockRequest[]> => {
		try {
			const response = await api.get('/stock-request');
			return response.data;
		} catch (error) {
			throw new Error(getErrorMessage(error, 'Failed to fetch stock requests'));
		}
	},

	// Get stock requests by department
	getStockRequestsByDepartment: async (
		department: Department,
	): Promise<StockRequest[]> => {
		try {
			const response = await api.get('/stock-request', {
				params: { requestedFrom: department },
			});
			return response.data;
		} catch (error) {
			throw new Error(
				getErrorMessage(
					error,
					`Failed to fetch ${department.toLowerCase()} stock requests`,
				),
			);
		}
	},

	// Create new stock request
	createStockRequest: async (
		request: CreateStockRequest,
	): Promise<StockRequest> => {
		try {
			const response = await api.post('/stock-request', request);
			return response.data;
		} catch (error) {
			throw new Error(getErrorMessage(error, 'Failed to create stock request'));
		}
	},

	// Update stock request status
	updateStockRequestStatus: async (
		id: number,
		status: UpdateStockRequestStatus,
	): Promise<StockRequest> => {
		try {
			const response = await api.patch(`/stock-request/${id}/status`, status);
			return response.data;
		} catch (error) {
			throw new Error(
				getErrorMessage(error, 'Failed to update stock request status'),
			);
		}
	},

	// Get department inventory items
	getDepartmentInventory: async (
		department: Department,
	): Promise<DepartmentInventoryItem[]> => {
		try {
			const response = await api.get('/department-inventory', {
				params: { department },
			});
			return response.data;
		} catch (error) {
			throw new Error(
				getErrorMessage(
					error,
					`Failed to fetch ${department.toLowerCase()} inventory items`,
				),
			);
		}
	},

	// Get all inventory items
	getAllInventoryItems: async (): Promise<InventoryItem[]> => {
		try {
			const response = await api.get('/inventory-item');
			return response.data;
		} catch (error) {
			throw new Error(
				getErrorMessage(error, 'Failed to fetch inventory items'),
			);
		}
	},

	// Get inventory item by ID
	getInventoryItemById: async (id: number): Promise<InventoryItem> => {
		try {
			const response = await api.get(`/inventory-item/${id}`);
			return response.data;
		} catch (error) {
			throw new Error(getErrorMessage(error, 'Failed to fetch inventory item'));
		}
	},

	// Get available items for purchase orders (items with stock)
	getAvailableItems: async (): Promise<InventoryItem[]> => {
		try {
			const response = await api.get('/inventory-item/available');
			return response.data;
		} catch (error) {
			// If endpoint doesn't exist, fall back to getting all items
			try {
				const allItems = await InventoryService.getAllInventoryItems();
				return allItems;
			} catch {
				throw new Error(
					getErrorMessage(error, 'Failed to fetch available items'),
				);
			}
		}
	},
};
