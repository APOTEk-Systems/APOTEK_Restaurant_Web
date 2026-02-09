import { api } from './api';
import type {
	InventoryItem,
	DepartmentInventoryItem,
	Department,
	StockRequest,
	CreateStockRequest,
	UpdateStockRequestStatus,
	Category,
	InventoryUnit,
} from '../types/inventory.types';

// Define inventory adjustment types
export interface InventoryAdjustment {
	id: number;
	adjustmentNumber: string;
	inventoryItemId: number;
	batchId: number | null;
	adjustmentReasonId: number;
	adjustmentType: 'increase' | 'decrease' | 'correction';
	quantity: number;
	previousQuantity: number;
	newQuantity: number;
	notes: string | null;
	adjustedBy: string | null;
	createdAt: string;
	updatedAt: string;
	inventoryItem: {
		id: number;
		name: string;
		description: string;
		sku: string;
		categoryId: number;
		unit: string;
		department: string[];
		quantity: number;
		minStock: number;
		maxStock: number;
		price: number;
		supplier: string | null;
		location: string;
		storageLocation: string | null;
		status: string;
		createdAt: string;
		updatedAt: string;
	};
	batch: {
		id: number;
		batchNumber: string;
		inventoryItemId: number;
		quantity: number;
		receivedAt: string;
		expiryDate: string;
		createdAt: string;
		updatedAt: string;
	} | null;
	adjustmentReason: {
		id: number;
		name: string;
		type: 'increase' | 'decrease' | 'both';
		description: string;
		isActive: boolean;
		createdAt: string;
		updatedAt: string;
	};
}

export interface CreateInventoryAdjustmentDto {
	inventoryItemId: number;
	batchId?: number | null;
	adjustmentReasonId: number;
	adjustmentType: 'increase' | 'decrease' | 'correction';
	quantity: number;
	notes?: string;
}

export interface CreateInventoryItemDto {
	name: string;
	sku?: string;
	categoryId?: number;
	supplier?: string;
	description?: string;
	quantity: number;
	unit: string;
	price: number;
	minStock?: number;
	maxStock?: number;
	location?: string;
}

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
	// Get all inventory categories
	getAllCategories: async (): Promise<Category[]> => {
		try {
			const response = await api.get('/inventory-category');
			return response.data;
		} catch (error) {
			throw new Error(
				getErrorMessage(error, 'Failed to fetch inventory categories'),
			);
		}
	},

	// Get all inventory units
	getAllUnits: async (): Promise<InventoryUnit[]> => {
		try {
			const response = await api.get('/inventory-unit');
			return response.data;
		} catch (error) {
			throw new Error(
				getErrorMessage(error, 'Failed to fetch inventory units'),
			);
		}
	},

	// Create new inventory item
	createInventoryItem: async (
		itemData: CreateInventoryItemDto,
	): Promise<InventoryItem> => {
		try {
			const response = await api.post('/inventory-item', itemData);
			return response.data;
		} catch (error) {
			throw new Error(
				getErrorMessage(error, 'Failed to create inventory item'),
			);
		}
	},

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

	// Get all inventory adjustments
	getAllInventoryAdjustments: async (): Promise<InventoryAdjustment[]> => {
		try {
			const response = await api.get('/inventory-adjustments');
			return response.data;
		} catch (error) {
			throw new Error(
				getErrorMessage(error, 'Failed to fetch inventory adjustments'),
			);
		}
	},

	// Get inventory adjustment by ID
	getInventoryAdjustmentById: async (id: string): Promise<InventoryAdjustment> => {
		try {
			const response = await api.get(`/inventory-adjustments/${id}`);
			return response.data;
		} catch (error) {
			throw new Error(
				getErrorMessage(error, 'Failed to fetch inventory adjustment'),
			);
		}
	},

	// Create new inventory adjustment
	createInventoryAdjustment: async (
		adjustmentData: CreateInventoryAdjustmentDto,
	): Promise<InventoryAdjustment> => {
		try {
			const response = await api.post('/inventory-adjustments', adjustmentData);
			return response.data;
		} catch (error) {
			throw new Error(
				getErrorMessage(error, 'Failed to create inventory adjustment'),
			);
		}
	},

	// Update inventory adjustment
	updateInventoryAdjustment: async (
		id: string,
		adjustmentData: Partial<CreateInventoryAdjustmentDto>,
	): Promise<InventoryAdjustment> => {
		try {
			const response = await api.patch(`/inventory-adjustments/${id}`, adjustmentData);
			return response.data;
		} catch (error) {
			throw new Error(
				getErrorMessage(error, 'Failed to update inventory adjustment'),
			);
		}
	},

	// Delete inventory adjustment
	deleteInventoryAdjustment: async (id: string): Promise<void> => {
		try {
			await api.delete(`/inventory-adjustments/${id}`);
		} catch (error) {
			throw new Error(
				getErrorMessage(error, 'Failed to delete inventory adjustment'),
			);
		}
	},
};
