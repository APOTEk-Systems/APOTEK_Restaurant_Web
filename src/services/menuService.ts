import { api } from './api';

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
  addons: any[];
  sideDishes: any[];
  menuCategory: {
    id: number;
    name: string;
    description: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

interface MenuAddon {
  id: number;
  name: string;
  description: string | null;
  price: number;
  isAvailable: boolean;
  seasonal: boolean;
  createdAt: string;
  updatedAt: string;
}

interface MenuSideDish {
  id: number;
  name: string;
  description: string | null;
  price: number;
  isAvailable: boolean;
  seasonal: boolean;
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

// Export types for use in components
export type { MenuItem, MenuAddon, MenuSideDish, MenuCategory };

export const MenuService = {
  // Menu Items
  getAllMenuItems: async (): Promise<MenuItem[]> => {
    const response = await api.get('/menu/menu-items');
    return response.data;
  },

  getMenuItemById: async (id: number): Promise<MenuItem> => {
    const response = await api.get(`/menu/menu-items/${id}`);
    return response.data;
  },

  createMenuItem: async (menuItemData: {
    name: string;
    description: string;
    price: number;
    cost?: number;
    prepTime?: number;
    calories?: number;
    servingSize?: string;
    isAvailable: boolean;
    prepArea: string;
    categoryId: number;
    featured?: boolean;
    seasonal?: boolean;
    ingredients?: string[];
    allergens?: string[];
    dietaryOptions?: string[];
    sideDishIds?: number[];
    addonIds?: number[];
    hasAddons?: boolean;
    requiresSideDish?: boolean;
  }): Promise<MenuItem> => {
    const response = await api.post('/menu/menu-items', menuItemData);
    return response.data;
  },

  updateMenuItem: async (id: number, menuItemData: Partial<MenuItem>): Promise<MenuItem> => {
    const response = await api.put(`/menu/menu-items/${id}`, menuItemData);
    return response.data;
  },

  deleteMenuItem: async (id: number): Promise<void> => {
    await api.delete(`/menu/menu-items/${id}`);
  },

  // Menu Addons
  getAllMenuAddons: async (): Promise<MenuAddon[]> => {
    const response = await api.get('/menu/addons');
    return response.data;
  },

  getMenuAddonById: async (id: number): Promise<MenuAddon> => {
    const response = await api.get(`/menu/addons/${id}`);
    return response.data;
  },

  createMenuAddon: async (addonData: Omit<MenuAddon, 'id' | 'createdAt' | 'updatedAt'>): Promise<MenuAddon> => {
    const response = await api.post('/menu/addons', addonData);
    return response.data;
  },

  updateMenuAddon: async (id: number, addonData: Partial<MenuAddon>): Promise<MenuAddon> => {
    const response = await api.put(`/menu/addons/${id}`, addonData);
    return response.data;
  },

  deleteMenuAddon: async (id: number): Promise<void> => {
    await api.delete(`/menu/addons/${id}`);
  },

  // Menu Side Dishes
  getAllMenuSideDishes: async (): Promise<MenuSideDish[]> => {
    const response = await api.get('/menu/side-dishes');
    return response.data;
  },

  getMenuSideDishById: async (id: number): Promise<MenuSideDish> => {
    const response = await api.get(`/menu/side-dishes/${id}`);
    return response.data;
  },

  createMenuSideDish: async (sideDishData: Omit<MenuSideDish, 'id' | 'createdAt' | 'updatedAt'>): Promise<MenuSideDish> => {
    const response = await api.post('/menu/side-dishes', sideDishData);
    return response.data;
  },

  updateMenuSideDish: async (id: number, sideDishData: Partial<MenuSideDish>): Promise<MenuSideDish> => {
    const response = await api.put(`/menu/side-dishes/${id}`, sideDishData);
    return response.data;
  },

  deleteMenuSideDish: async (id: number): Promise<void> => {
    await api.delete(`/menu/side-dishes/${id}`);
  },

  // Menu Categories
  getAllMenuCategories: async (): Promise<MenuCategory[]> => {
    const response = await api.get('/menu/categories');
    return response.data;
  },

  getMenuCategoryById: async (id: number): Promise<MenuCategory> => {
    const response = await api.get(`/menu/categories/${id}`);
    return response.data;
  },

  createMenuCategory: async (categoryData: Omit<MenuCategory, 'id' | 'createdAt' | 'updatedAt'>): Promise<MenuCategory> => {
    const response = await api.post('/menu/categories', categoryData);
    return response.data;
  },

  updateMenuCategory: async (id: number, categoryData: Partial<MenuCategory>): Promise<MenuCategory> => {
    const response = await api.put(`/menu/categories/${id}`, categoryData);
    return response.data;
  },

  deleteMenuCategory: async (id: number): Promise<void> => {
    await api.delete(`/menu/categories/${id}`);
  },

  // Toggle availability for menu item
  toggleMenuItemAvailability: async (id: number, isAvailable: boolean): Promise<MenuItem> => {
    const response = await api.patch(`/menu/menu-items/${id}`, { isAvailable });
    return response.data;
  },

  // Toggle availability for addon
  toggleAddonAvailability: async (id: number, isAvailable: boolean): Promise<MenuAddon> => {
    const response = await api.patch(`/menu/addons/${id}`, { isAvailable });
    return response.data;
  },

  // Toggle availability for side dish
  toggleSideDishAvailability: async (id: number, isAvailable: boolean): Promise<MenuSideDish> => {
    const response = await api.patch(`/menu/side-dishes/${id}`, { isAvailable });
    return response.data;
  },
};