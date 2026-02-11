import { api } from './api';
import type {
	GoodsReceiving,
	CreateGoodsReceivingDto,
	UpdateGoodsReceivingDto,
} from '../types/goodsReceiving.types';

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

export const GoodsReceivingService = {
	// Get all goods receiving records
	getAllGoodsReceiving: async (): Promise<GoodsReceiving[]> => {
		const response = await api.get('/goods-receiving');
		return response.data;
	},

	// Get goods receiving by ID
	getGoodsReceivingById: async (id: string): Promise<GoodsReceiving> => {
		const response = await api.get(`/goods-receiving/${id}`);
		return response.data;
	},

	// Get goods receiving by purchase order ID
	getGoodsReceivingByPurchaseOrder: async (
		purchaseOrderId: string,
	): Promise<GoodsReceiving[]> => {
		const response = await api.get(`/goods-receiving/po/${purchaseOrderId}`);
		return response.data;
	},

	// Create goods receiving
	createGoodsReceiving: async (
		data: CreateGoodsReceivingDto,
	): Promise<GoodsReceiving> => {
		try {
			const response = await api.post('/goods-receiving', data);
			return response.data;
		} catch (error) {
			throw new Error(
				getErrorMessage(error, 'Failed to create goods receiving record'),
			);
		}
	},

	// Update goods receiving
	updateGoodsReceiving: async (
		id: string,
		data: UpdateGoodsReceivingDto,
	): Promise<GoodsReceiving> => {
		try {
			const response = await api.patch(`/goods-receiving/${id}`, data);
			return response.data;
		} catch (error) {
			throw new Error(
				getErrorMessage(error, 'Failed to update goods receiving record'),
			);
		}
	},

	// Delete goods receiving
	deleteGoodsReceiving: async (id: string): Promise<void> => {
		try {
			await api.delete(`/goods-receiving/${id}`);
		} catch (error) {
			throw new Error(
				getErrorMessage(error, 'Failed to delete goods receiving record'),
			);
		}
	},
};
