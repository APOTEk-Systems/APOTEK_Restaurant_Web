import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { authService, authUtils } from './authService';

// Live server URL or fallback to localhost
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Extend the config interface to include our custom properties
declare module 'axios' {
	export interface InternalAxiosRequestConfig {
		_retry?: boolean;
	}
}

export const api = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		'Content-Type': 'application/json',
	},
	withCredentials: true,
});

// Request interceptor - attach token to requests
api.interceptors.request.use(
	(config) => {
		const token = authService.getToken();
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => Promise.reject(error),
);

// Response interceptor with silent refresh and error handling
api.interceptors.response.use(
	(response) => response,
	async (error: AxiosError) => {
		const originalRequest = error.config as InternalAxiosRequestConfig & {
			_retry?: boolean;
		};

		// Handle 401 Unauthorized - Token expired or invalid
		if (error.response?.status === 401 && originalRequest) {
			// Skip refresh attempt if the request is to the refresh endpoint itself
			// This prevents infinite loops when refresh token is invalid
			if (originalRequest.url === '/auth/refresh') {
				console.log('[AUTH] Refresh endpoint returned 401 - refresh token invalid, logging out...');
				authUtils.processQueue(new Error('Session expired'));
				authService.logoutWithoutRedirect().catch(() => {});
				return Promise.reject(error);
			}
			
			console.log('[AUTH] 401 received, attempting token refresh...');
			
			// If already retrying, reject immediately and logout
			if (originalRequest._retry) {
				console.log('[AUTH] Already retried, logging out...');
				// Fire and forget logout without redirect - don't await to prevent infinite waiting
				authService.logoutWithoutRedirect().catch(() => {});
				return Promise.reject(error);
			}

			// Mark as retrying to prevent infinite loops
			originalRequest._retry = true;

			// Check if refresh is already in progress
			if (!authUtils.isRefreshing()) {
				// Start token refresh process
				authUtils.setRefreshing(true);

				try {
					console.log('[AUTH] Calling refresh token endpoint...');
					const refreshSuccessful = await authService.refreshToken();

					if (refreshSuccessful) {
						console.log('[AUTH] Token refresh successful');
						// Refresh successful - process queued requests and retry original request
						authUtils.processQueue(null);

						// Retry the original request with new token
						const newToken = authService.getToken();
						originalRequest.headers.Authorization = `Bearer ${newToken}`;
						return api(originalRequest);
					} else {
						// Refresh failed - logout user without redirect
						console.log('[AUTH] Token refresh returned false, logging out...');
						authUtils.processQueue(new Error('Session expired'));
						// Fire and forget logout without redirect
						authService.logoutWithoutRedirect().catch(() => {});
					}
				} catch (refreshError) {
					// Refresh error - process queue and logout without redirect
					console.log('[AUTH] Token refresh threw error, logging out:', refreshError);
					authUtils.processQueue(refreshError);
					// Fire and forget logout without redirect
					authService.logoutWithoutRedirect().catch(() => {});
				} finally {
					authUtils.setRefreshing(false);
				}
			} else {
				// Refresh in progress - add request to queue
				console.log('[AUTH] Refresh in progress, queuing request...');
				return new Promise((resolve, reject) => {
					authUtils.addPendingRequest(
						() => {
							// Retry the original request
							const newToken = authService.getToken();
							originalRequest.headers.Authorization = `Bearer ${newToken}`;
							resolve(api(originalRequest));
						},
						(err) => {
							reject(err);
						},
					);
				});
			}
		}

		// Handle 403 Forbidden - Insufficient permissions
		if (error.response?.status === 403) {
			// Show toast notification for 403 errors
			// This will be handled by the component, but we can also show a general message
			console.error('[API ERROR] Forbidden - insufficient permissions:', {
				url: originalRequest?.url,
				method: originalRequest?.method,
			});
		}

		// Log other errors
		if (error.response) {
			console.error('[API ERROR]', {
				url: error.config?.url,
				method: error.config?.method,
				status: error.response.status,
				data: error.response.data,
			});
		} else if (error.request) {
			console.error('[API NO RESPONSE]', error.request);
		} else {
			console.error('[API SETUP ERROR]', error.message);
		}

		return Promise.reject(error);
	},
);

// Helper function to get error message from response
export const getErrorMessage = (error: unknown): string => {
	if (axios.isAxiosError(error)) {
		const axiosError = error as AxiosError<{ message?: string }>;
		if (axiosError.response?.data?.message) {
			return axiosError.response.data.message;
		}
		if (axiosError.response?.status === 401) {
			return 'Your session has expired. Please log in again.';
		}
		if (axiosError.response?.status === 403) {
			return "You don't have permission to perform this action.";
		}
		if (axiosError.response?.status === 404) {
			return 'The requested resource was not found.';
		}
		if (axiosError.response?.status === 500) {
			return 'Server error. Please try again later.';
		}
	}
	return 'An unexpected error occurred. Please try again.';
};
