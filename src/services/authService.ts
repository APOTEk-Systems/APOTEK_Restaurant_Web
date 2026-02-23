import { api } from './api';

export interface LoginCredentials {
	email: string;
	password: string;
}

export interface AuthUser {
	id: number;
	username: string;
	email?: string;
	staffId?: number;
	userGroupId?: number;
	userGroupName?: string;
	staff?: {
		firstName: string;
		lastName: string;
		imageUrl?: string;
	};
}

export interface AuthResponse {
	user: AuthUser;
	accessToken: string;
	refreshToken?: string;
}

// Token storage keys
const TOKEN_KEY = 'token';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'user';

// Auth service for handling authentication logic
export const authService = {
	/**
	 * Get the current access token
	 */
	getToken: (): string | null => {
		return localStorage.getItem(TOKEN_KEY);
	},

	/**
	 * Get the current refresh token
	 */
	getRefreshToken: (): string | null => {
		return localStorage.getItem(REFRESH_TOKEN_KEY);
	},

	/**
	 * Store authentication data
	 */
	setAuthData: (data: AuthResponse): void => {
		localStorage.setItem(TOKEN_KEY, data.accessToken);
		if (data.refreshToken) {
			localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
		}
		localStorage.setItem(USER_KEY, JSON.stringify(data.user));
	},

	/**
	 * Get stored user data
	 */
	getUser: (): AuthUser | null => {
		const userStr = localStorage.getItem(USER_KEY);
		if (userStr) {
			try {
				return JSON.parse(userStr);
			} catch {
				return null;
			}
		}
		return null;
	},

	/**
	 * Check if user is authenticated
	 */
	isAuthenticated: (): boolean => {
		return !!localStorage.getItem(TOKEN_KEY);
	},

	/**
	 * Clear all authentication data (logout)
	 */
	clearAuthData: (): void => {
		localStorage.removeItem(TOKEN_KEY);
		localStorage.removeItem(REFRESH_TOKEN_KEY);
		localStorage.removeItem(USER_KEY);
	},

	/**
	 * Attempt to refresh the access token
	 * Returns true if refresh successful, false otherwise
	 */
	refreshToken: async (): Promise<boolean> => {
		const refreshToken = authService.getRefreshToken();

		if (!refreshToken) {
			return false;
		}

		try {
			const response = await api.post('/auth/refresh', { refreshToken });

			if (response.data && response.data.accessToken) {
				localStorage.setItem(TOKEN_KEY, response.data.accessToken);
				if (response.data.refreshToken) {
					localStorage.setItem(REFRESH_TOKEN_KEY, response.data.refreshToken);
				}
				return true;
			}

			return false;
		} catch (error) {
			console.error('Token refresh failed:', error);
			return false;
		}
	},

	/**
	 * Login with credentials
	 */
	login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
		const response = await api.post('/auth/login', credentials);
		authService.setAuthData(response.data);
		return response.data;
	},

	/**
	 * Logout - clears auth data
	 */
	logout: (): void => {
		authService.clearAuthData();
		// Redirect to login page
		if (window.location.pathname !== '/login') {
			window.location.href = '/login';
		}
	},
};

// Flag to track if token refresh is in progress
let isRefreshing = false;

// Queue of requests waiting for token refresh
type ResolveFunction = (value: unknown) => void;
type RejectFunction = (reason?: unknown) => void;

const pendingRequests: {
	resolve: ResolveFunction;
	reject: RejectFunction;
}[] = [];

export const authUtils = {
	/**
	 * Check if token refresh is in progress
	 */
	isRefreshing: (): boolean => isRefreshing,

	/**
	 * Set token refresh status
	 */
	setRefreshing: (value: boolean): void => {
		isRefreshing = value;
	},

	/**
	 * Add a request to the queue
	 */
	addPendingRequest: (
		resolve: ResolveFunction,
		reject: RejectFunction,
	): void => {
		pendingRequests.push({ resolve, reject });
	},

	/**
	 * Process all queued requests
	 */
	processQueue: (error: unknown | null): void => {
		pendingRequests.forEach(({ resolve, reject }) => {
			if (error) {
				reject(error);
			} else {
				resolve('Token refreshed');
			}
		});
		pendingRequests.length = 0;
	},
};
