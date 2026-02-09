export type Department =
	| 'KITCHEN'
	| 'BAR'
	| 'SERVICE'
	| 'OPERATIONS'
	| 'MANAGEMENT';

export interface Supplier {
	id: number;
	name: string;
	description?: string;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
	supplierId?: number;
}

export interface Category {
	id: number;
	name: string;
	description?: string;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
	supplierId?: number;
}

export interface InventoryUnit {
	id: number;
	name: string;
	type: string;
	symbol: string;
	description?: string;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface InventoryItem {
	id: number;
	name: string;
	unit: string;
	price: number;
	quantity?: number;
	stock?: number; // For backward compatibility
	category?: Category;
	description?: string;
	supplier?: Supplier;
}

export interface DepartmentInventoryItem {
	id: number;
	name: string;
	categoryName: string;
	currentStock: number;
	departmentInventoryId: number | null;
	unit: string;
	department: Department;
}

export type StockRequestStatus =
	| 'pending'
	| 'approved'
	| 'fulfilled'
	| 'rejected';

export interface StockRequestItem {
	id: number;
	requestId: number;
	itemId: number;
	quantity: number;
	status: StockRequestStatus;
	item: InventoryItem;
}

export interface StockRequest {
	id: number;
	requestId: string;
	status: StockRequestStatus;
	requestedBy: string | null;
	requestedFrom: Department;
	requestedAt: string;
	approvedAt: string | null;
	fulfilledAt: string | null;
	requestItems: StockRequestItem[];
}

export interface CreateStockRequestItem {
	itemId: number;
	quantity: number;
}

export interface CreateStockRequest {
	requestedFrom: Department;
	requestItems: CreateStockRequestItem[];
	requestedBy?: string;
}

export interface UpdateStockRequestStatus {
	status: StockRequestStatus;
	resolution?: string;
}
