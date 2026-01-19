import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, ChefHat, CheckCircle2, AlertCircle, Play, Bell, Utensils } from "lucide-react";
import { useState } from "react";

// Define the KitchenOrderStatus enum
enum KitchenOrderStatus {
  PENDING = "pending",
  PREPARING = "preparing",
  READY = "ready"
}

// Define the BarOrderStatus enum
enum BarOrderStatus {
  PENDING = "pending",
  READY = "ready"
}

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  modifications: string;
  status: KitchenOrderStatus;
}

interface KitchenOrder {
  id: string;
  table: string;
  items: OrderItem[];
  time: string;
  priority: "high" | "normal";
  course: "starter" | "main" | "dessert";
}

const kitchenOrders: KitchenOrder[] = [
  {
    id: "ORD-001",
    table: "Table 5",
    items: [
      { id: "item-1", name: "Grilled Salmon", quantity: 2, modifications: "No butter", status: KitchenOrderStatus.PREPARING },
      { id: "item-2", name: "Caesar Salad", quantity: 1, modifications: "", status: KitchenOrderStatus.PENDING },
    ],
    time: "12 min",
    priority: "high",
    course: "main",
  },
  {
    id: "ORD-002",
    table: "Table 12",
    items: [
      { id: "item-3", name: "Mushroom Risotto", quantity: 1, modifications: "Extra parmesan", status: KitchenOrderStatus.PENDING },
      { id: "item-4", name: "Garlic Bread", quantity: 2, modifications: "", status: KitchenOrderStatus.PENDING },
    ],
    time: "5 min",
    priority: "normal",
    course: "starter",
  },
  {
    id: "ORD-003",
    table: "Table 8",
    items: [
      { id: "item-5", name: "Chocolate Lava Cake", quantity: 3, modifications: "", status: KitchenOrderStatus.READY },
      { id: "item-6", name: "Tiramisu", quantity: 2, modifications: "No alcohol", status: KitchenOrderStatus.READY },
    ],
    time: "2 min",
    priority: "normal",
    course: "dessert",
  },
  {
    id: "ORD-004",
    table: "Table 3",
    items: [
      { id: "item-7", name: "Beef Wellington", quantity: 1, modifications: "Medium rare", status: KitchenOrderStatus.PENDING },
      { id: "item-8", name: "Truffle Mash", quantity: 1, modifications: "", status: KitchenOrderStatus.PENDING },
    ],
    time: "0 min",
    priority: "high",
    course: "main",
  },
];

const statusStyles = {
  [KitchenOrderStatus.PENDING]: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  [KitchenOrderStatus.PREPARING]: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  [KitchenOrderStatus.READY]: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
};

const statusIcons = {
  [KitchenOrderStatus.PENDING]: Clock,
  [KitchenOrderStatus.PREPARING]: ChefHat,
  [KitchenOrderStatus.READY]: CheckCircle2,
};

const courseColors = {
  starter: "bg-purple-500/10 text-purple-500",
  main: "bg-orange-500/10 text-orange-500",
  dessert: "bg-pink-500/10 text-pink-500",
};

export default function KitchenOrders() {
  const [orders, setOrders] = useState<KitchenOrder[]>(kitchenOrders);

  const updateItemStatus = (orderId: string, itemId: string, newStatus: KitchenOrderStatus) => {
    setOrders(orders.map(order => {
      if (order.id === orderId) {
        return {
          ...order,
          items: order.items.map(item =>
            item.id === itemId ? { ...item, status: newStatus } : item
          )
        };
      }
      return order;
    }));

    // In a real app, this would call an API to update the item status
    console.log(`Updated item ${itemId} in order ${orderId} to ${newStatus}`);
  };

  const getOrderStatus = (order: KitchenOrder): KitchenOrderStatus => {
    // Determine overall order status based on individual items
    const hasPending = order.items.some(item => item.status === KitchenOrderStatus.PENDING);
    const hasPreparing = order.items.some(item => item.status === KitchenOrderStatus.PREPARING);
    const hasReady = order.items.some(item => item.status === KitchenOrderStatus.READY);

    if (hasPending) return KitchenOrderStatus.PENDING;
    if (hasPreparing) return KitchenOrderStatus.PREPARING;
    if (hasReady) return KitchenOrderStatus.READY;

    return KitchenOrderStatus.PENDING;
  };

  const getActionButtons = (order: KitchenOrder, item: OrderItem) => {
    switch (item.status) {
      case KitchenOrderStatus.PENDING:
        return (
          <Button
            size="sm"
            className="h-8 bg-primary hover:bg-primary/90"
            onClick={() => updateItemStatus(order.id, item.id, KitchenOrderStatus.PREPARING)}
          >
            <Play className="h-3 w-3 mr-1" /> Start
          </Button>
        );
      case KitchenOrderStatus.PREPARING:
        return (
          <Button
            size="sm"
            className="h-8 bg-success hover:bg-success/90 text-success-foreground"
            onClick={() => updateItemStatus(order.id, item.id, KitchenOrderStatus.READY)}
          >
            <CheckCircle2 className="h-3 w-3 mr-1" /> Ready
          </Button>
        );
      case KitchenOrderStatus.READY:
        return (
          <Button
            size="sm"
            className="h-8 bg-sidebar/70 hover:bg-sidebar/50"
            onClick={() => updateItemStatus(order.id, item.id, KitchenOrderStatus.PENDING)}
          >
            <Bell className="h-3 w-3 mr-1" /> Served
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <MainLayout title="Kitchen Orders">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Kitchen Orders</h1>
          <p className="text-muted-foreground mt-1">Manage incoming food orders</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-amber-500">
                    {orders.filter((o) =>
                      o.items.some(item => item.status === KitchenOrderStatus.PENDING)
                    ).length}
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
                  <p className="text-sm text-muted-foreground">Cooking</p>
                  <p className="text-2xl font-bold text-blue-500">
                    {orders.filter((o) =>
                      o.items.some(item => item.status === KitchenOrderStatus.PREPARING)
                    ).length}
                  </p>
                </div>
                <ChefHat className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ready</p>
                  <p className="text-2xl font-bold text-emerald-500">
                    {orders.filter((o) =>
                      o.items.some(item => item.status === KitchenOrderStatus.READY)
                    ).length}
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
                  <p className="text-sm text-muted-foreground">Total Items</p>
                  <p className="text-2xl font-bold text-foreground">
                    {orders.reduce((acc, o) => acc + o.items.reduce((a, i) => a + i.quantity, 0), 0)}
                  </p>
                </div>
                <Utensils className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map((order) => {
            const orderStatus = getOrderStatus(order);
            const StatusIcon = statusIcons[orderStatus];
            return (
              <Card key={order.id} className={`glass-card ${order.priority === "high" ? "ring-2 ring-destructive/50" : ""}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{order.table}</CardTitle>
                      {order.priority === "high" && (
                        <AlertCircle className="h-4 w-4 text-destructive" />
                      )}
                    </div>
                    <Badge className={statusStyles[orderStatus]}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {orderStatus}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{order.id}</span>
                    <span>•</span>
                    <Badge variant="secondary" className={courseColors[order.course]}>
                      {order.course}
                    </Badge>
                    <span>•</span>
                    <span>{order.time} ago</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-start p-2 rounded-lg bg-muted/30">
                        <div className="flex-1">
                          <p className="font-medium">{item.quantity}x {item.name}</p>
                          {item.modifications && (
                            <p className="text-xs text-muted-foreground italic">{item.modifications}</p>
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
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
}
