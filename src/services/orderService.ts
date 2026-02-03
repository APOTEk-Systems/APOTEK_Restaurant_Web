import { api } from './api';

interface OrderItem {
  id: number;
  orderId: number;
  menuItemId: number;
  quantity: number;
  price: number;
  notes: string | null;
  prepArea: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  kitchenOrderId: number | null;
  barOrderId: number | null;
}

interface KitchenOrder {
  id: number;
  orderId: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  order?: {
    id: number;
    orderNumber: number;
    tableNumber: number | null;
    status: string;
    customerName: string | null;
    waiter: string | null;
    guestCount: number | null;
    total: number;
    orderItems: {
      id: number;
      menuItem: {
        name: string;
      };
    }[];
  };
}

// Enhanced interfaces for kitchen orders with details
interface MenuAddon {
  id: number;
  name: string;
  price: number;
  isAvailable: boolean;
}

interface MenuSideDish {
  id: number;
  name: string;
  price: number;
  isAvailable: boolean;
}

interface MenuItem {
  id: number;
  name: string;
  hasAddons: boolean;
  requiresSideDish: boolean;
  addons: MenuAddon[];
  sideDishes: MenuSideDish[];
}

interface EnhancedOrderItem extends OrderItem {
  selectedSideDishes: number[];
  selectedAddons: number[];
  menuItem: MenuItem;
}

interface EnhancedKitchenOrder extends Omit<KitchenOrder, 'items'> {
  items: EnhancedOrderItem[];
  order: {
    id: number;
    orderNumber: number;
    tableNumber: number | null;
    status: string;
    customerName: string | null;
    waiter: string | null;
    guestCount: number | null;
    total: number;
    orderItems: {
      id: number;
      menuItem: {
        name: string;
      };
    }[];
  };
}

interface BarOrder {
  id: number;
  orderId: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  order?: {
    id: number;
    orderNumber: number;
    tableNumber: number | null;
    status: string;
    customerName: string | null;
    waiter: string | null;
    guestCount: number | null;
    total: number;
    orderItems: {
      id: number;
      menuItem: {
        name: string;
      };
    }[];
  };
}

interface Order {
  id: number;
  orderNumber: number;
  tableNumber: number;
  status: string;
  customerName: string | null;
  waiter: string | null;
  guestCount: number | null;
  total: number;
  createdAt: string;
  updatedAt: string;
  orderItems: OrderItem[];
  kitchenOrder: KitchenOrder | null;
  barOrder: BarOrder | null;
}

interface CreateOrderData {
  tableNumber: number;
  customerName?: string;
  waiter?: string;
  guestCount?: number;
  orderItems: {
    menuItemId: number;
    quantity: number;
    notes?: string;
  }[];
}

interface UpdateOrderData {
  tableNumber?: number;
  customerName?: string;
  waiter?: string;
  guestCount?: number;
  status?: string;
}

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

  updateOrder: async (id: number, orderData: UpdateOrderData): Promise<Order> => {
    const response = await api.patch(`/order/${id}`, orderData);
    return response.data;
  },

  updateOrderStatus: async (orderId: number, status: { status: string }): Promise<Order> => {
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

  updateKitchenOrderStatus: async (id: number, status: { status: string }): Promise<KitchenOrder> => {
    const response = await api.patch(`/order/kitchen-orders/${id}`, status);
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

  updateBarOrderStatus: async (id: number, status: { status: string }): Promise<BarOrder> => {
    const response = await api.patch(`/order/bar-orders/${id}`, status);
    return response.data;
  },

  // Order Items
  updateOrderItemStatus: async (id: number, status: { status: string }): Promise<OrderItem> => {
    const response = await api.patch(`/order/order-items/${id}`, status);
    return response.data;
  },

  // Recent Orders
  getRecentOrders: async (): Promise<Order[]> => {
    const response = await api.get('/order/recent');
    return response.data;
  },
};