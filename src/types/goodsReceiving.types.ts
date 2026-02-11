import type { Supplier } from './supplier.types';

// API response type - matching actual backend response
export interface GoodsReceiving {
	id: number;
	grnNumber: string;
	purchaseOrderId: number | null;
	supplierId: number;
	receivedAt: string | null;
	notes: string | null;
	status?: string; // Goods receiving status (if returned directly)
	createdAt: string;
	updatedAt: string;
	totalItems?: number; // Item count (camelCase)
	total_items?: number; // Item count (snake_case from API)
	receivedItems?: GoodsReceivingItem[]; // Made optional as API might not return in list
	supplier: {
		id: number;
		name: string;
		contactPerson?: string;
		email?: string;
		phone?: string;
		address?: string;
		createdAt: string;
		updatedAt: string;
	} | null;
	purchaseOrder: {
		id: number;
		poNumber: string;
		supplierId: number;
		status: string;
		notes?: string;
		orderedAt: string;
		expectedDeliveryAt: string | null;
		createdAt: string;
		updatedAt: string;
	} | null;
}

export interface GoodsReceivingItem {
	id: number;
	goodsReceivingId: number;
	inventoryItemId: number;
	quantityReceived: number;
	batchId: number | null;
	createdAt: string;
	updatedAt: string;
	inventoryItem: {
		id: number;
		name: string;
		description?: string;
		sku?: string;
		categoryId: number;
		unit: string;
		department: string[];
		quantity: number;
		minStock: number;
		maxStock: number | null;
		price: number;
		supplier: string | null;
		location?: string;
		storageLocation?: string | null;
		status: string;
		createdAt: string;
		updatedAt: string;
	} | null;
	batch: {
		id: number;
		batchNumber: string;
		inventoryItemId: number;
		quantity: number;
		receivedAt: string;
		expiryDate: string;
		createdAt: string;
		updatedAt: string;
	} | null;
}

export type GoodsReceivingStatus = 'pending' | 'partial' | 'complete' | 'issue';

// Create DTO types (for POST/PATCH requests) - matching actual API
export interface CreateGoodsReceivingDto {
	purchaseOrderId: number;
	supplierId: number;
	receivedAt?: string;
	notes?: string;
	receivedItems: CreateGoodsReceivingItemDto[];
}

export interface CreateGoodsReceivingItemDto {
	inventoryItemId: number;
	quantityReceived: number;
	batchId?: number;
}

export interface UpdateGoodsReceivingDto {
	purchaseOrderId?: number;
	supplierId?: number;
	receivedAt?: string;
	notes?: string;
	receivedItems?: UpdateGoodsReceivingItemDto[];
}

export interface UpdateGoodsReceivingItemDto {
	id?: number;
	inventoryItemId: number;
	quantityReceived: number;
	batchId?: number;
}

export interface GoodsReceivingStats {
	totalReceived: number;
	pending: number;
	partial: number;
	issues: number;
}
