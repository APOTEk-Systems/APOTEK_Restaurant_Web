import { api } from './api';
import type { Notification } from '../types/common';

interface NotificationResponse {
	notifications: Notification[];
	unreadCount: number;
}

export const NotificationService = {
	// Get all notifications for the current user
	getNotifications: async (
		page: number = 1,
		limit: number = 20,
	): Promise<NotificationResponse> => {
		try {
			const response = await api.get('/notifications', {
				params: { page, limit },
			});
			return {
				notifications: response.data.notifications || [],
				unreadCount: response.data.unreadCount || 0,
			};
		} catch (error) {
			console.error('Get notifications error:', error);
			return { notifications: [], unreadCount: 0 };
		}
	},

	// Get unread notifications count
	getUnreadCount: async (): Promise<number> => {
		try {
			const response = await api.get('/notifications/unread-count');
			return response.data.count || 0;
		} catch (error) {
			console.error('Get unread count error:', error);
			return 0;
		}
	},

	// Mark notification as read
	markAsRead: async (notificationId: number): Promise<void> => {
		try {
			await api.put(`/notifications/${notificationId}/read`);
		} catch (error) {
			console.error('Mark as read error:', error);
			throw error;
		}
	},

	// Mark all notifications as read
	markAllAsRead: async (): Promise<void> => {
		try {
			await api.put('/notifications/mark-all-read');
		} catch (error) {
			console.error('Mark all as read error:', error);
			throw error;
		}
	},

	// Delete notification
	deleteNotification: async (notificationId: number): Promise<void> => {
		try {
			await api.delete(`/notifications/${notificationId}`);
		} catch (error) {
			console.error('Delete notification error:', error);
			throw error;
		}
	},

	// Create a notification (for system use)
	createNotification: async (
		notification: Omit<Notification, 'id' | 'isRead' | 'createdAt'>,
	): Promise<Notification> => {
		try {
			const response = await api.post('/notifications', notification);
			return response.data;
		} catch (error) {
			console.error('Create notification error:', error);
			throw error;
		}
	},
};
