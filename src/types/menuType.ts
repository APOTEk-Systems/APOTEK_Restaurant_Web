interface MenuAddon {
	id: number;
	name: string;
	description: string | null;
	price: number;
	isAvailable: boolean;
	createdAt: string;
	updatedAt: string;
}

interface MenuSideDish {
	id: number;
	name: string;
	description: string | null;
	price: number;
	isAvailable: boolean;
	createdAt: string;
	updatedAt: string;
}

interface MenuCategory {
	id: number;
	name: string;
	description: string;
	prepArea: string;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

interface MenuItem {
	id: number;
	name: string;
	description: string;
	price: number;
	isAvailable: boolean;
	prepArea: string;
	categoryId: number;
	rating: number;
	cost: number | null;
	prepTime: number | null;
	calories: number | null;
	servingSize: string | null;
	ingredients: string[];
	allergens: string[];
	dietaryOptions: string[];
	featured: boolean;
	seasonal: boolean;
	hasAddons: boolean;
	requiresSideDish: boolean;
	createdAt: string;
	updatedAt: string;
	addons: MenuAddon[];
	sideDishes: MenuSideDish[];
	menuCategory: MenuCategory;
}

export type { MenuItem, MenuAddon, MenuSideDish, MenuCategory };
