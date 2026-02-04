import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface RecentOrdersProps {
  orders: any[];
  isLoading: boolean;
}

const statusStyles = {
  pending: "bg-warning/10 text-warning border-warning/20",
  preparing: "bg-primary/10 text-primary border-primary/20",
  served: "bg-success/10 text-success border-success/20",
  completed: "bg-muted text-muted-foreground border-border",
};

const getTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  
  return date.toLocaleDateString();
};

export function RecentOrders({ orders = [], isLoading }: RecentOrdersProps) {
  return (
    <div className="bg-card rounded-xl shadow-card border border-border/50 overflow-hidden">
      <div className="px-6 py-4 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">Recent Orders</h3>
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : orders.length === 0 ? (
        <div className="px-6 py-12 text-center text-muted-foreground">
          No recent orders
        </div>
      ) : (
        <div className="divide-y divide-border">
          {orders.slice(0, 5).map((order) => (
            <div key={order.id} className="px-6 py-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-medium text-foreground">#{order.orderNumber}</p>
                    <p className="text-sm text-muted-foreground">
                      Table {order.tableNumber || 'N/A'} • {order.orderItems?.length || 0} items
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge className={cn("capitalize", statusStyles[order.status as keyof typeof statusStyles] || statusStyles.pending)}>
                    {order.status || 'pending'}
                  </Badge>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">TZS {(order.total || 0).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{getTimeAgo(order.createdAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
