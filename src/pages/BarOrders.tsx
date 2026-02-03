import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle2, AlertCircle, Play, Bell, GlassWater } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { OrderService } from "@/services/orderService";
import { toast } from "@/components/ui/use-toast";

enum OrderItemStatus {
  PENDING = "PENDING",
  PREPARING = "PREPARING",
  READY = "READY",
  CANCELED = "CANCELED"
}

// Define the BarOrderStatus enum
enum BarOrderStatus {
  PENDING = "PENDING",
  READY = "READY"
}

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

interface OrderItem {
  id: number;
  orderId: number;
  menuItemId: number;
  quantity: number;
  price: number;
  notes: string | null;
  prepArea: string;
  status: OrderItemStatus;
  selectedSideDishes: number[];
  selectedAddons: number[];
  menuItem: MenuItem;
  createdAt: string;
  updatedAt: string;
  kitchenOrderId: number | null;
  barOrderId: number | null;
}

interface BarOrder {
  id: number;
  orderId: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
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
  } | null;
}

interface BarOrderWithDetails extends Omit<BarOrder, 'status'> {
  orderId: number;
  status: BarOrderStatus;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
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

const statusStyles: Record<string, string> = {
  PENDING: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  PREPARING: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  READY: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  CANCELLED: "bg-red-500/10 text-red-500 border-red-500/20",
};

const statusIcons = {
  [BarOrderStatus.PENDING]: Clock,
  [BarOrderStatus.READY]: CheckCircle2,
};

export default function BarOrders() {
  const queryClient = useQueryClient();

  const {
    data: orders = [],
    isLoading,
    isError,
    error,
    refetch
  } = useQuery<BarOrderWithDetails[]>({
    queryKey: ['barOrders'],
    queryFn: async () => {
      const barOrders = await OrderService.getAllBarOrders();
      return barOrders.map(order => {
        const barStatusMap: Record<string, BarOrderStatus> = {
          PENDING: BarOrderStatus.PENDING,
          READY: BarOrderStatus.READY
        };
        const itemStatusMap: Record<string, OrderItemStatus> = {
          PENDING: OrderItemStatus.PENDING,
          PREPARING: OrderItemStatus.PREPARING,
          READY: OrderItemStatus.READY,
          CANCELED: OrderItemStatus.CANCELED
        };

        return {
          id: order.id,
          orderId: order.orderId,
          status: barStatusMap[order.status] || BarOrderStatus.PENDING,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          items: order.items.map(item => {
            const enhancedItem = item as any;
            return {
              id: item.id,
              orderId: item.orderId,
              menuItemId: item.menuItemId,
              quantity: item.quantity,
              price: item.price,
              notes: item.notes,
              prepArea: item.prepArea,
              status: itemStatusMap[item.status] || OrderItemStatus.PENDING,
              createdAt: item.createdAt,
              updatedAt: item.updatedAt,
              kitchenOrderId: item.kitchenOrderId,
              barOrderId: item.barOrderId,
              selectedSideDishes: enhancedItem.selectedSideDishes || [],
              selectedAddons: enhancedItem.selectedAddons || [],
              menuItem: enhancedItem.menuItem || {
                id: item.menuItemId,
                name: 'Unknown Item',
                hasAddons: false,
                requiresSideDish: false,
                addons: [],
                sideDishes: []
              }
            };
          }),
          order: order.order || {
            id: order.orderId,
            orderNumber: 0,
            tableNumber: null,
            status: 'PENDING',
            customerName: null,
            waiter: null,
            guestCount: null,
            total: 0,
            orderItems: []
          }
        };
      });
    },
    refetchInterval: 30000,
  });

  const updateItemStatusMutation = useMutation({
    mutationFn: async ({ itemId, newStatus }: { orderId: number, itemId: number, newStatus: OrderItemStatus }) => {
      return OrderService.updateOrderItemStatus(itemId, { status: newStatus });
    },
    onMutate: async ({ orderId, itemId, newStatus }) => {
      await queryClient.cancelQueries({ queryKey: ['barOrders'] });
      const previousOrders = queryClient.getQueryData<BarOrder[]>(['barOrders']);
      queryClient.setQueryData<BarOrder[]>(['barOrders'], (oldOrders = []) =>
        oldOrders.map(order =>
          order.id === orderId
            ? {
                ...order,
                items: order.items.map(item =>
                  item.id === itemId ? { ...item, status: newStatus } : item
                ),
              }
            : order
        )
      );
      return { previousOrders };
    },
    onSuccess: () => {
      // Backend now handles all cascading status updates
      toast({
        title: "Status Updated",
        description: "Order item status has been updated.",
      });
    },
    onError: (err, variables, context) => {
      if (context?.previousOrders) {
        queryClient.setQueryData(['barOrders'], context.previousOrders);
      }
      toast({
        title: "Update failed",
        description: "Failed to update item status. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['barOrders'] });
    }
  });

  const getOrderStatus = (order: BarOrder): BarOrderStatus => {
    const hasPreparing = order.items.some(item => item.status === OrderItemStatus.PREPARING);
    if (hasPreparing) return BarOrderStatus.PENDING;

    const allReadyOrCancelled = order.items.every(item => item.status === OrderItemStatus.READY || item.status === OrderItemStatus.CANCELED);
    if (allReadyOrCancelled) return BarOrderStatus.READY;

    return BarOrderStatus.PENDING;
  };

  const getTimeAgo = (createdAt: string): string => {
    const now = new Date();
    const createdDate = new Date(createdAt);
    const minutesAgo = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60));

    if (minutesAgo < 1) return "just now";
    if (minutesAgo < 60) return `${minutesAgo} min ago`;
    const hoursAgo = Math.floor(minutesAgo / 60);
    return `${hoursAgo} hour${hoursAgo > 1 ? 's' : ''} ago`;
  };

  const getPriorityFromItems = (items: OrderItem[]): "high" | "normal" => {
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    return totalQuantity >= 4 || items.length >= 3 ? "high" : "normal";
  };

  const getActionButtons = (order: BarOrder, item: OrderItem) => {
    switch (item.status) {
      case OrderItemStatus.PENDING:
        return (
          <Button
            size="sm"
            className="h-8 bg-primary hover:bg-primary/90"
            onClick={() => updateItemStatusMutation.mutate({
              orderId: order.id,
              itemId: item.id,
              newStatus: OrderItemStatus.PREPARING
            })}
            disabled={updateItemStatusMutation.isPending}
          >
            <Play className="h-3 w-3 mr-1" /> Start
          </Button>
        );
      case OrderItemStatus.PREPARING:
        return (
          <Button
            size="sm"
            className="h-8 bg-success hover:bg-success/90 text-success-foreground"
            onClick={() => updateItemStatusMutation.mutate({
              orderId: order.id,
              itemId: item.id,
              newStatus: OrderItemStatus.READY
            })}
            disabled={updateItemStatusMutation.isPending}
          >
            <CheckCircle2 className="h-3 w-3 mr-1" /> Ready
          </Button>
        );
      case OrderItemStatus.READY:
        return (
          <Button
            size="sm"
            className="h-8 bg-sidebar/70 hover:bg-sidebar/50"
            disabled
          >
            <Bell className="h-3 w-3 mr-1" /> Served
          </Button>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <MainLayout title="Bar Orders">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Bar Orders</h1>
            <p className="text-muted-foreground mt-1">Loading orders...</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="glass-card h-24 animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="glass-card h-48 animate-pulse" />
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  if (isError) {
    return (
      <MainLayout title="Bar Orders">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Bar Orders</h1>
            <p className="text-muted-foreground mt-1">Manage incoming drink orders</p>
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-destructive mb-2">Error Loading Orders</h2>
              <p className="text-muted-foreground">{error?.message || 'Unknown error'}</p>
              <Button
                className="mt-4"
                onClick={() => refetch()}
                disabled={updateItemStatusMutation.isPending}
              >
                {updateItemStatusMutation.isPending ? 'Retrying...' : 'Retry'}
              </Button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Bar Orders">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Bar Orders</h1>
          <p className="text-muted-foreground mt-1">Manage incoming drink orders</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-amber-500">
                    {orders.filter((o) => getOrderStatus(o) === BarOrderStatus.PENDING).length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ready</p>
                  <p className="text-2xl font-bold text-emerald-500">
                    {orders.filter((o) => getOrderStatus(o) === BarOrderStatus.READY).length}
                  </p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Drinks</p>
                  <p className="text-2xl font-bold text-foreground">
                    {orders.reduce((acc, o) => acc + o.items.reduce((a, i) => a + i.quantity, 0), 0)}
                  </p>
                </div>
                <GlassWater className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.length > 0 ? (
            orders.map((order) => {
              const orderStatus = getOrderStatus(order);
              const StatusIcon = statusIcons[orderStatus];
              const priority = getPriorityFromItems(order.items);
              const timeAgo = getTimeAgo(order.createdAt);

              return (
                <Card key={order.id} className={`glass-card ${priority === "high" ? "ring-2 ring-destructive/50" : ""}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">Table {order.order.tableNumber || 'N/A'}</CardTitle>
                        {priority === "high" && (
                          <AlertCircle className="h-4 w-4 text-destructive" />
                        )}
                      </div>
                      <Badge className={statusStyles[orderStatus]}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {orderStatus}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Order #{order.order.orderNumber}</span>
                      <span>•</span>
                      <span>{timeAgo}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex flex-col gap-2 p-2 rounded-lg bg-muted/30">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-medium">{item.quantity}x {item.menuItem.name}</p>
                              {item.notes && (
                                <p className="text-xs text-muted-foreground italic">{item.notes}</p>
                              )}
                              <div className="mt-1">
                                <Badge className={statusStyles[item.status]}>
                                  {item.status}
                                </Badge>
                              </div>
                            </div>
                            <div className="ml-2">
                              {getActionButtons(order, item)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <div className="col-span-full flex items-center justify-center h-64">
              <div className="text-center">
                <GlassWater className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-muted-foreground mb-2">No Orders Found</h2>
                <p className="text-muted-foreground">There are no active bar orders at the moment.</p>
                <Button
                  className="mt-4"
                  onClick={() => refetch()}
                  disabled={updateItemStatusMutation.isPending}
                >
                  Refresh
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
