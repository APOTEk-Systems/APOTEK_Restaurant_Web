export interface Supplier {
	id: number;
	name: string;
	contactPerson: string;
	email: string;
	phone: string;
	address: string;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
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
	contactPerson: string;
	email: string;
	phone: string;
	address: string;
}

export interface UpdateSupplierDto {
	name?: string;
	contactPerson?: string;
	email?: string;
	phone?: string;
	address?: string;
}

export interface SupplierStats {
	totalSuppliers: number;
	activeSuppliers: number;
	topRated: number;
	categories: number;
}
