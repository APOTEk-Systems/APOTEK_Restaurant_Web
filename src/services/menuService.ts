import { api } from './api';
import type {
	MenuItem,
	MenuAddon,
	MenuSideDish,
	MenuCategory,
} from '../types/menuType';

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

	createMenuItem: async (
		menuItemData: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>,
	): Promise<MenuItem> => {
		const response = await api.post('/menu/menu-items', menuItemData);
		return response.data;
	},

	updateMenuItem: async (
		id: number,
		menuItemData: Partial<MenuItem>,
	): Promise<MenuItem> => {
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

	createMenuAddon: async (
		addonData: Omit<MenuAddon, 'id' | 'createdAt' | 'updatedAt'>,
	): Promise<MenuAddon> => {
		const response = await api.post('/menu/addons', addonData);
		return response.data;
	},

	updateMenuAddon: async (
		id: number,
		addonData: Partial<MenuAddon>,
	): Promise<MenuAddon> => {
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

	createMenuSideDish: async (
		sideDishData: Omit<MenuSideDish, 'id' | 'createdAt' | 'updatedAt'>,
	): Promise<MenuSideDish> => {
		const response = await api.post('/menu/side-dishes', sideDishData);
		return response.data;
	},

	updateMenuSideDish: async (
		id: number,
		sideDishData: Partial<MenuSideDish>,
	): Promise<MenuSideDish> => {
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

	createMenuCategory: async (
		categoryData: Omit<MenuCategory, 'id' | 'createdAt' | 'updatedAt'>,
	): Promise<MenuCategory> => {
		const response = await api.post('/menu/categories', categoryData);
		return response.data;
	},

	updateMenuCategory: async (
		id: number,
		categoryData: Partial<MenuCategory>,
	): Promise<MenuCategory> => {
		const response = await api.put(`/menu/categories/${id}`, categoryData);
		return response.data;
	},

	deleteMenuCategory: async (id: number): Promise<void> => {
		await api.delete(`/menu/categories/${id}`);
	},
};
