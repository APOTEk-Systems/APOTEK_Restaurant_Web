export interface SearchResult {
	id: number;
	type: 'menu_item' | 'order' | 'user' | 'inventory' | 'supplier';
	title: string;
	subtitle?: string;
	url: string;
	category?: string;
}

export interface Notification {
	id: number;
	type: 'info' | 'warning' | 'error' | 'success';
	title: string;
	message: string;
	isRead: boolean;
	createdAt: string;
	actionUrl?: string;
	metadata?: Record<string, any>;
}
