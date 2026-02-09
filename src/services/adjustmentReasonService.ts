import { api } from './api';
import type { AdjustmentReason, CreateAdjustmentReasonDto, UpdateAdjustmentReasonDto } from '../types/adjustmentReason.types';

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

export const AdjustmentReasonService = {
	// Get all adjustment reasons
	getAllAdjustmentReasons: async (): Promise<AdjustmentReason[]> => {
		try {
			const response = await api.get('/adjustment-reasons');
			return response.data;
		} catch (error) {
			throw new Error(
				getErrorMessage(error, 'Failed to fetch adjustment reasons'),
			);
		}
	},

	// Get adjustment reason by ID
	getAdjustmentReasonById: async (id: number): Promise<AdjustmentReason> => {
		try {
			const response = await api.get(`/adjustment-reasons/${id}`);
			return response.data;
		} catch (error) {
			throw new Error(
				getErrorMessage(error, 'Failed to fetch adjustment reason'),
			);
		}
	},

	// Create new adjustment reason
	createAdjustmentReason: async (
		reasonData: CreateAdjustmentReasonDto,
	): Promise<AdjustmentReason> => {
		try {
			const response = await api.post('/adjustment-reasons', reasonData);
			return response.data;
		} catch (error) {
			throw new Error(
				getErrorMessage(error, 'Failed to create adjustment reason'),
			);
		}
	},

	// Update adjustment reason
	updateAdjustmentReason: async (
		id: number,
		reasonData: UpdateAdjustmentReasonDto,
	): Promise<AdjustmentReason> => {
		try {
			const response = await api.patch(`/adjustment-reasons/${id}`, reasonData);
			return response.data;
		} catch (error) {
			throw new Error(
				getErrorMessage(error, 'Failed to update adjustment reason'),
			);
		}
	},

	// Delete adjustment reason
	deleteAdjustmentReason: async (id: number): Promise<void> => {
		try {
			await api.delete(`/adjustment-reasons/${id}`);
		} catch (error) {
			throw new Error(
				getErrorMessage(error, 'Failed to delete adjustment reason'),
			);
		}
	},
};
