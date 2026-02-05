import { api } from './api';
import type {
	PurchaseOrder,
	CreatePurchaseOrderDto,
	UpdatePurchaseOrderDto,
} from '../types/purchaseOrder.types';

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
		// Extract error messages from the errors array
		const errorMessages = errors
			.map((e) => e?.message || e?.field || JSON.stringify(e))
			.join(', ');
		return `${data?.message || 'Validation error'}: ${errorMessages}`;
	}

	return String(data?.message || data?.error || defaultMessage);
};

export const PurchaseOrderService = {
	// Get all purchase orders
	getAllPurchaseOrders: async (): Promise<PurchaseOrder[]> => {
		const response = await api.get('/purchase-orders');
		return response.data;
	},

	// Get purchase order by ID
	getPurchaseOrderById: async (id: string): Promise<PurchaseOrder> => {
		const response = await api.get(`/purchase-orders/${id}`);
		return response.data;
	},

	// Create purchase order
	createPurchaseOrder: async (
		purchaseOrderData: CreatePurchaseOrderDto,
	): Promise<PurchaseOrder> => {
		try {
			const response = await api.post('/purchase-orders', purchaseOrderData);
			return response.data;
		} catch (error) {
			throw new Error(
				getErrorMessage(error, 'Failed to create purchase order'),
			);
		}
	},

	// Update purchase order
	updatePurchaseOrder: async (
		id: string,
		purchaseOrderData: UpdatePurchaseOrderDto,
	): Promise<PurchaseOrder> => {
		try {
			const response = await api.patch(
				`/purchase-orders/${id}`,
				purchaseOrderData,
			);
			return response.data;
		} catch (error) {
			throw new Error(
				getErrorMessage(error, 'Failed to update purchase order'),
			);
		}
	},

	// Delete purchase order
	deletePurchaseOrder: async (id: string): Promise<void> => {
		try {
			await api.delete(`/purchase-orders/${id}`);
		} catch (error) {
			throw new Error(
				getErrorMessage(error, 'Failed to delete purchase order'),
			);
		}
	},
};
