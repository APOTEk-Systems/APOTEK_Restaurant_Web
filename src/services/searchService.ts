import { api } from './api';
import type { SearchResult } from '../types/common';

interface SearchResponse {
	results: SearchResult[];
	total: number;
}

export const SearchService = {
	// Global search across all entities
	globalSearch: async (
		query: string,
		limit: number = 10,
	): Promise<SearchResult[]> => {
		if (!query.trim()) return [];

		try {
			const response = await api.get('/search', {
				params: { q: query, limit },
			});
			return response.data.results || [];
		} catch (error) {
			console.error('Search error:', error);
			return [];
		}
	},

	// Search menu items specifically
	searchMenuItems: async (query: string): Promise<SearchResult[]> => {
		if (!query.trim()) return [];

		try {
			const response = await api.get('/search/menu-items', {
				params: { q: query },
			});
			return response.data.results || [];
		} catch (error) {
			console.error('Menu items search error:', error);
			return [];
		}
	},

	// Search orders
	searchOrders: async (query: string): Promise<SearchResult[]> => {
		if (!query.trim()) return [];

		try {
			const response = await api.get('/search/orders', {
				params: { q: query },
			});
			return response.data.results || [];
		} catch (error) {
			console.error('Orders search error:', error);
			return [];
		}
	},

	// Search users/staff
	searchUsers: async (query: string): Promise<SearchResult[]> => {
		if (!query.trim()) return [];

		try {
			const response = await api.get('/search/users', {
				params: { q: query },
			});
			return response.data.results || [];
		} catch (error) {
			console.error('Users search error:', error);
			return [];
		}
	},
};
