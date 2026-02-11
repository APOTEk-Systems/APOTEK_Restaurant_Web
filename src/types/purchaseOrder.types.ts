export interface PurchaseItem {
	id: number;
	name: string;
	unit: string;
	quantity?: number;
	quantityOrdered?: number;
	price?: number;
	unitPrice?: number;
}

// PurchaseOrder type that handles both response formats
// The API may return either nested supplier object or flat supplier_name
export interface PurchaseOrder {
	id: string;
	poNumber?: string;
	supplier_id: number;
	supplier_name?: string;
	supplier?: {
		id: number;
		name: string;
		contactPerson?: string;
		email?: string;
		phone?: string;
		address?: string;
	};
	items: PurchaseItem[];
	total: number;
	date?: string;
	orderedAt?: string;
	expectedDeliveryAt?: string;
	delivery_date?: string;
	status: string;
	created_at?: string;
	updated_at?: string;
}

// Backend API schema for creating purchase orders - uses camelCase naming
export interface CreatePurchaseOrderDto {
	poNumber: string;
	supplierId: number;
	status:
		| 'PENDING'
		| 'APPROVED'
		| 'ORDERED'
		| 'PARTIALLY_RECEIVED'
		| 'COMPLETED'
		| 'CANCELLED';
	notes?: string;
	orderedAt: string;
	expectedDeliveryAt: string;
	items: {
		inventoryItemId: number;
		quantityOrdered: number;
		unitPrice: number;
	}[];
}

export interface UpdatePurchaseOrderDto {
	supplier_id?: number;
	items?: {
		item_id: number;
		quantity: number;
		unit_price?: number;
		discount?: number;
	}[];
	delivery_date?: string;
	status?: string;
}

export interface PurchaseOrderStats {
	totalOrders: number;
	pending: number;
	inTransit: number;
	delivered: number;
	cancelled: number;
	totalSpent: number;
}
