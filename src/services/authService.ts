import axios from 'axios';
import { api } from './api';

// Custom event for logout notifications
export const LOGOUT_EVENT = 'apotek-logout';

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
	} | null;
}

export interface AuthResponse {
	user: AuthUser;
	accessToken: string;
	refreshToken?: string;
}

// Token storage keys
const TOKEN_KEY = 'token';
const USER_KEY = 'user';

// Auth service for handling authentication logic
export const authService = {
	/**
	 * Get the current access token
	 * Note: Refresh token is now stored in HTTP-only cookies
	 */
	getToken: (): string | null => {
		return localStorage.getItem(TOKEN_KEY);
	},

	/**
	 * Store authentication data
	 * Note: Refresh token is stored in HTTP-only cookies, not localStorage
	 */
	setAuthData: (data: AuthResponse): void => {
		localStorage.setItem(TOKEN_KEY, data.accessToken);
		// Store user data (refresh token is handled by HTTP-only cookie)
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
		localStorage.removeItem(USER_KEY);
	},

	/**
	 * Attempt to refresh the access token
	 * Note: Refresh token is sent automatically via HTTP-only cookie
	 * Returns true if refresh successful, false otherwise
	 */
	refreshToken: async (): Promise<boolean> => {
		try {
			// Refresh token is automatically sent via HTTP-only cookie
			// No need to pass it explicitly
			console.log('[AUTH] Attempting token refresh...');
			const response = await api.post('/auth/refresh', {}, {
				// Ensure credentials (cookies) are sent with the request
				withCredentials: true,
			});

			console.log('[AUTH] Refresh response status:', response.status);
			console.log('[AUTH] Refresh response data:', response.data);

			if (response.data && response.data.accessToken) {
				localStorage.setItem(TOKEN_KEY, response.data.accessToken);
				// Update user data if provided
				if (response.data.user) {
					localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
				}
				return true;
			}

			console.warn('[AUTH] Refresh response missing accessToken');
			return false;
		} catch (error: unknown) {
			console.error('[AUTH] Token refresh failed:', error);
			if (axios.isAxiosError(error)) {
				console.error('[AUTH] Refresh error status:', error.response?.status);
				console.error('[AUTH] Refresh error data:', error.response?.data);
			}
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
	 * Logout - clears auth data and tells backend to clear the cookie
	 */
	logout: async (): Promise<void> => {
		authService.clearAuthData();
		
		// Call logout endpoint to clear the refresh token cookie on the backend
		try {
			await api.post('/auth/logout', {}, {
				withCredentials: true,
			});
		} catch (error) {
			// Continue with logout even if the backend call fails
			console.error('Logout API call failed:', error);
		}
		
		// Redirect to login page
		if (window.location.pathname !== '/login') {
			window.location.href = '/login';
		}
	},

	/**
	 * Logout without redirect - used by the API interceptor when token refresh fails
	 * This clears the auth data but doesn't redirect, allowing the app to handle the redirect
	 */
	logoutWithoutRedirect: async (): Promise<void> => {
		authService.clearAuthData();
		
		// Dispatch custom event to notify AuthContext and other components
		window.dispatchEvent(new CustomEvent(LOGOUT_EVENT));
		
		// Call logout endpoint to clear the refresh token cookie on the backend
		try {
			await api.post('/auth/logout', {}, {
				withCredentials: true,
			});
		} catch (error) {
			// Continue with logout even if the backend call fails
			console.error('Logout API call failed:', error);
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
