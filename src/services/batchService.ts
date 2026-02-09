import { api } from './api';

// Batch types based on API documentation
export interface Batch {
	id: number;
	batchNumber: string;
	inventoryItemId: number;
	quantity: number;
	receivedAt: string;
	expiryDate: string;
	createdAt: string;
	updatedAt: string;
	inventoryItem?: {
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
}

export interface ExpiringBatch extends Batch {
	daysLeft: number;
	status: 'critical' | 'warning' | 'normal';
	location: string;
}

export interface UpdateBatchDto {
	quantity?: number;
	expiryDate?: string;
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

export const BatchService = {
	// Get all batches
	getAllBatches: async (): Promise<Batch[]> => {
		try {
			const response = await api.get('/batches');
			return response.data;
		} catch (error) {
			throw new Error(getErrorMessage(error, 'Failed to fetch batches'));
		}
	},

	// Get expiring batches
	getExpiringBatches: async (): Promise<ExpiringBatch[]> => {
		try {
			const response = await api.get('/batches/expiring');
			return response.data;
		} catch (error) {
			throw new Error(
				getErrorMessage(error, 'Failed to fetch expiring batches'),
			);
		}
	},

	// Get batch by ID
	getBatchById: async (id: number): Promise<Batch> => {
		try {
			const response = await api.get(`/batches/${id}`);
			return response.data;
		} catch (error) {
			throw new Error(getErrorMessage(error, 'Failed to fetch batch'));
		}
	},

	// Get batches by item ID
	getBatchesByItemId: async (itemId: number): Promise<Batch[]> => {
		try {
			const response = await api.get(`/batches/item/${itemId}`);
			return response.data;
		} catch (error) {
			throw new Error(
				getErrorMessage(error, 'Failed to fetch batches by item'),
			);
		}
	},

	// Update batch
	updateBatch: async (id: number, data: UpdateBatchDto): Promise<Batch> => {
		try {
			const response = await api.patch(`/batches/${id}`, data);
			return response.data;
		} catch (error) {
			throw new Error(getErrorMessage(error, 'Failed to update batch'));
		}
	},
};
