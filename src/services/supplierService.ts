import { api } from './api';
import type {
	Supplier,
	CreateSupplierDto,
	UpdateSupplierDto,
	SupplierStats,
} from '../types/supplier.types';

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

export const SupplierService = {
	// Get all suppliers
	getAllSuppliers: async (): Promise<Supplier[]> => {
		const response = await api.get('/suppliers');
		return response.data;
	},

	// Get supplier by ID
	getSupplierById: async (id: number): Promise<Supplier> => {
		const response = await api.get(`/suppliers/${id}`);
		return response.data;
	},

	// Create supplier
	createSupplier: async (
		supplierData: CreateSupplierDto,
	): Promise<Supplier> => {
		try {
			const response = await api.post('/suppliers', supplierData);
			return response.data;
		} catch (error: unknown) {
			const message = getErrorMessage(error, 'Failed to create supplier');
			throw new Error(message);
		}
	},

	// Update supplier
	updateSupplier: async (
		id: number,
		supplierData: UpdateSupplierDto,
	): Promise<Supplier> => {
		try {
			const response = await api.put(`/suppliers/${id}`, supplierData);
			return response.data;
		} catch (error: unknown) {
			const message = getErrorMessage(error, 'Failed to update supplier');
			throw new Error(message);
		}
	},

	// Delete supplier
	deleteSupplier: async (id: number): Promise<void> => {
		try {
			await api.delete(`/suppliers/${id}`);
		} catch (error: unknown) {
			const message = getErrorMessage(error, 'Failed to delete supplier');
			throw new Error(message);
		}
	},

	// Update supplier status
	updateSupplierStatus: async (
		id: number,
		isActive: boolean,
	): Promise<Supplier> => {
		try {
			const response = await api.patch(`/suppliers/${id}/status`, { isActive });
			return response.data;
		} catch (error: unknown) {
			const message = getErrorMessage(
				error,
				'Failed to update supplier status',
			);
			throw new Error(message);
		}
	},

	// Calculate supplier statistics
	calculateStats: (suppliers: Supplier[]): SupplierStats => {
		const uniqueInventoryCategories = new Set<string>();
		suppliers.forEach((s) => {
			s.inventoryCategories?.forEach((cat) => {
				if (cat.isActive) uniqueInventoryCategories.add(cat.name);
			});
		});

		return {
			totalSuppliers: suppliers.length,
			activeSuppliers: suppliers.filter((s) => s.isActive).length,
			topRated: suppliers.length, // No rating system in new schema
			categories: uniqueInventoryCategories.size,
		};
	},
};
