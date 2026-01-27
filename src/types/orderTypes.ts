export interface OrderItem {
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

export interface KitchenOrder {
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

export interface EnhancedKitchenOrder extends Omit<KitchenOrder, 'items'> {
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

export interface BarOrder {
    id: number;
    orderId: number;
    status: string;
    createdAt: string;
    updatedAt: string;
    items: OrderItem[];
}

export interface Order {
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

export interface CreateOrderData {
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

export interface UpdateOrderData {
    tableNumber?: number;
    customerName?: string;
    waiter?: string;
    guestCount?: number;
    status?: string;
}