export interface Supplier {
	id: number;
	name: string;
	contact_person?: string;
	email?: string;
	phone?: string;
	address?: string;
	tax_rate?: number;
	isActive: boolean;
	created_at?: string;
	updated_at?: string;
	inventoryCategories?: Array<{
		id: number;
		name: string;
		description: string;
		isActive: boolean;
		supplierId: number;
	}>;
}

export interface CreateSupplierDto {
	name: string;
	contact_person?: string;
	email?: string;
	phone?: string;
	address?: string;
	tax_rate?: number;
}

export interface UpdateSupplierDto {
	name?: string;
	contact_person?: string;
	email?: string;
	phone?: string;
	address?: string;
	tax_rate?: number;
}

export interface SupplierStats {
	totalOrders: number;
	pending: number;
	inTransit: number;
	delivered: number;
	cancelled: number;
	totalSpent: number;
}
