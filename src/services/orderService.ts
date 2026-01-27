import { api } from './api';
import { Order, KitchenOrder, BarOrder, OrderItem, CreateOrderData, UpdateOrderData, EnhancedKitchenOrder } from '../types/orderTypes';

export const OrderService = {
	// Orders
	getAllOrders: async (): Promise<Order[]> => {
		const response = await api.get('/order');
		return response.data;
	},

	getOrderById: async (id: number): Promise<Order> => {
		const response = await api.get(`/order/${id}`);
		console.log(response.data.orderItems);
		return response.data;
	},

	createOrder: async (orderData: CreateOrderData): Promise<Order> => {
		const response = await api.post('/order', orderData);
		return response.data;
	},

	updateOrder: async (
		id: number,
		orderData: UpdateOrderData,
	): Promise<Order> => {
		const response = await api.patch(`/order/${id}`, orderData);
		return response.data;
	},

	updateOrderStatus: async (
		orderId: number,
		status: { status: string },
	): Promise<Order> => {
		const response = await api.patch(`/order/${orderId}/status`, status);
		return response.data;
	},

	deleteOrder: async (id: number): Promise<void> => {
		await api.delete(`/order/${id}`);
	},

	// Kitchen Orders
	getAllKitchenOrders: async (): Promise<KitchenOrder[]> => {
		const response = await api.get('/order/kitchen-orders');
		return response.data;
	},

	getKitchenOrderById: async (id: number): Promise<KitchenOrder> => {
		const response = await api.get(`/order/kitchen-orders/${id}`);
		return response.data;
	},

	updateKitchenOrderStatus: async (
		id: number,
		status: { status: string },
	): Promise<KitchenOrder> => {
		const response = await api.patch(`/order/kitchen-orders/${id}`, status);
		return response.data;
	},

	// Kitchen Orders with Details (including sides and addons)
	getKitchenOrdersWithDetails: async (): Promise<EnhancedKitchenOrder[]> => {
		const response = await api.get('/order/kitchen-orders-with-details');
		return response.data;
	},

	// Bar Orders
	getAllBarOrders: async (): Promise<BarOrder[]> => {
		const response = await api.get('/order/bar-orders');
		return response.data;
	},

	getBarOrderById: async (id: number): Promise<BarOrder> => {
		const response = await api.get(`/order/bar-orders/${id}`);
		return response.data;
	},

	updateBarOrderStatus: async (
		id: number,
		status: { status: string },
	): Promise<BarOrder> => {
		const response = await api.patch(`/order/bar-orders/${id}`, status);
		return response.data;
	},

	// Order Items
	updateOrderItemStatus: async (
		id: number,
		status: { status: string },
	): Promise<OrderItem> => {
		const response = await api.patch(`/order/order-items/${id}`, status);
		return response.data;
	},

	// Recent Orders
	getRecentOrders: async (): Promise<Order[]> => {
		const response = await api.get('/order/recent');
		return response.data;
	},

	// Orders History with filtering
	getOrdersHistory: async (params?: {
		startDate?: string;
		endDate?: string;
		status?: string;
		page?: number;
		limit?: number;
	}): Promise<{
		orders: Order[];
		total: number;
		page: number;
		limit: number;
	}> => {
		const response = await api.get('/order', { params });
		return response.data;
	},

	// Export orders
	exportOrders: async (params?: {
		startDate?: string;
		endDate?: string;
		status?: string;
		format?: 'csv' | 'excel' | 'pdf';
	}): Promise<Blob> => {
		const response = await api.get('/order/export', {
			params,
			responseType: 'blob',
		});
		return response.data;
	},

	// Get orders statistics - TODO: Implement on backend
	// getOrdersStats: async (params?: {
	//   startDate?: string;
	//   endDate?: string;
	// }): Promise<{
	//   totalOrders: number;
	//   totalRevenue: number;
	//   averageOrderValue: number;
	//   periodComparison?: {
	//     ordersChange: number;
	//     revenueChange: number;
	//   };
	// }> => {
	//   const response = await api.get('/order/stats', { params });
	//   return response.data;
	// },
};
