import { api } from './api';
import type { Table, AvailableTable } from '../types/table.types';

const getErrorMessage = (error: unknown, defaultMessage: string): string => {
	if (!error) return defaultMessage;
	const err = error as Record<string, unknown>;
	const response = err?.response as Record<string, unknown>;
	if (!response) return defaultMessage;
	const data = response?.data as Record<string, unknown>;
	if (!data) return defaultMessage;

	const errors = data?.errors as Array<Record<string, string>>;
	if (Array.isArray(errors) && errors.length > 0) {
		const errorMessages = errors
			.map((e) => e?.message || e?.field || JSON.stringify(e))
			.join(', ');
		return `${data?.message || 'Validation error'}: ${errorMessages}`;
	}

	return String(data?.message || data?.error || defaultMessage);
};

export const TableService = {
	// Get all tables
	getAllTables: async (): Promise<Table[]> => {
		const response = await api.get('/tables');
		return response.data;
	},

	// Get available tables (optionally filtered by date/time)
	getAvailableTables: async (dateTime?: string): Promise<AvailableTable[]> => {
		const params = dateTime ? { dateTime } : {};
		const response = await api.get('/tables/available', { params });
		return response.data;
	},
};
