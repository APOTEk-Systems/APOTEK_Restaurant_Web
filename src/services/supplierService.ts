import { api } from './api';
import type {
	Supplier,
	CreateSupplierDto,
	UpdateSupplierDto,
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

	// Update supplier (use PATCH — backend expects partial updates)
	updateSupplier: async (
		id: number,
		supplierData: UpdateSupplierDto,
	): Promise<Supplier> => {
		try {
			const response = await api.patch(`/suppliers/${id}`, supplierData);
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

	// Calculate supplier statistics
	calculateStats: (
		suppliers: Supplier[],
		categories: string[],
	): { totalSuppliers: number; categories: number } => {
		return {
			totalSuppliers: suppliers.length,
			categories: categories.length,
		};
	},
};
