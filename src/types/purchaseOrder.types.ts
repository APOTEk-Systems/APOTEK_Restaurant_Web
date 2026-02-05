export interface PurchaseItem {
	id: number;
	name: string;
	unit: string;
	quantity: number;
	price: number;
}

export interface PurchaseOrder {
	id: string;
	supplierId: number;
	supplierName: string;
	items: PurchaseItem[];
	total: number;
	date: string;
	deliveryDate: string;
	status: 'pending' | 'in-transit' | 'delivered' | 'cancelled';
	createdAt: string;
	updatedAt: string;
}

export interface CreatePurchaseOrderDto {
	supplierId: number;
	items: {
		itemId: number;
		quantity: number;
	}[];
	deliveryDate: string;
}

export interface UpdatePurchaseOrderDto {
	supplierId?: number;
	items?: {
		itemId: number;
		quantity: number;
	}[];
	deliveryDate?: string;
	status?: 'pending' | 'in-transit' | 'delivered' | 'cancelled';
}

export interface PurchaseOrderStats {
	totalOrders: number;
	pending: number;
	inTransit: number;
	delivered: number;
	cancelled: number;
	totalSpent: number;
}
