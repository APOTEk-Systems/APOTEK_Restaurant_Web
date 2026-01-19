import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Wine, CheckCircle2, AlertCircle, Play, Bell, GlassWater } from "lucide-react";
import { useState } from "react";

// Define the BarOrderStatus enum
enum BarOrderStatus {
  PENDING = "pending",
  READY = "ready"
}

interface BarOrderItem {
  id: string;
  name: string;
  quantity: number;
  modifications: string;
  status: BarOrderStatus;
}

interface BarOrder {
  id: string;
  table: string;
  items: BarOrderItem[];
  time: string;
  priority: "high" | "normal";
}

const barOrders: BarOrder[] = [
  {
    id: "BAR-001",
    table: "Table 5",
    items: [
      { id: "item-1", name: "Mojito", quantity: 2, modifications: "Extra mint", status: BarOrderStatus.PENDING },
      { id: "item-2", name: "Old Fashioned", quantity: 1, modifications: "", status: BarOrderStatus.READY },
    ],
    time: "3 min",
    priority: "normal",
  },
  {
    id: "BAR-002",
    table: "Bar Seat 3",
    items: [
      { id: "item-3", name: "Espresso Martini", quantity: 2, modifications: "", status: BarOrderStatus.PENDING },
    ],
    time: "1 min",
    priority: "high",
  },
  {
    id: "BAR-003",
    table: "Table 12",
    items: [
      { id: "item-4", name: "House Red Wine", quantity: 1, modifications: "", status: BarOrderStatus.READY },
      { id: "item-5", name: "Sparkling Water", quantity: 2, modifications: "", status: BarOrderStatus.READY },
    ],
    time: "5 min",
    priority: "normal",
  },
  {
    id: "BAR-004",
    table: "Table 8",
    items: [
      { id: "item-6", name: "Margarita", quantity: 3, modifications: "Salt rim", status: BarOrderStatus.PENDING },
      { id: "item-7", name: "Corona", quantity: 2, modifications: "", status: BarOrderStatus.PENDING },
    ],
    time: "0 min",
    priority: "normal",
  },
];

const statusStyles = {
  [BarOrderStatus.PENDING]: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  [BarOrderStatus.READY]: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
};

const statusIcons = {
  [BarOrderStatus.PENDING]: Clock,
  [BarOrderStatus.READY]: CheckCircle2,
};

export default function BarOrders() {
  const [orders, setOrders] = useState<BarOrder[]>(barOrders);

  const updateItemStatus = (orderId: string, itemId: string, newStatus: BarOrderStatus) => {
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

  const getOrderStatus = (order: BarOrder): BarOrderStatus => {
    // Determine overall order status based on individual items
    const hasPending = order.items.some(item => item.status === BarOrderStatus.PENDING);
    const hasReady = order.items.some(item => item.status === BarOrderStatus.READY);

    if (hasPending) return BarOrderStatus.PENDING;
    if (hasReady) return BarOrderStatus.READY;

    return BarOrderStatus.PENDING;
  };

  const getActionButtons = (order: BarOrder, item: BarOrderItem) => {
    switch (item.status) {
      case BarOrderStatus.PENDING:
        return (
          <Button
            size="sm"
            className="h-8 bg-primary hover:bg-primary/90"
            onClick={() => updateItemStatus(order.id, item.id, BarOrderStatus.READY)}
          >
            <Play className="h-3 w-3 mr-1" /> Start
          </Button>
        );
      case BarOrderStatus.READY:
        return (
          <Button
            size="sm"
            className="h-8 bg-sidebar/70 hover:bg-sidebar/50"
            onClick={() => updateItemStatus(order.id, item.id, BarOrderStatus.PENDING)}
          >
            <Bell className="h-3 w-3 mr-1" /> Served
          </Button>
        );
      default:
        return null;
    }
  };

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
                    {orders.filter((o) =>
                      o.items.some(item => item.status === BarOrderStatus.PENDING)
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
                  <p className="text-sm text-muted-foreground">Ready</p>
                  <p className="text-2xl font-bold text-emerald-500">
                    {orders.filter((o) =>
                      o.items.some(item => item.status === BarOrderStatus.READY)
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
