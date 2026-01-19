import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const orders = [
  { id: "#ORD-001", table: "Table 5", items: 4, total: 86.50 * 2400, status: "preparing", time: "5 min ago" },
  { id: "#ORD-002", table: "Table 12", items: 2, total: 42.00 * 2400, status: "served", time: "12 min ago" },
  { id: "#ORD-003", table: "Table 3", items: 6, total: 156.00 * 2400, status: "pending", time: "18 min ago" },
  { id: "#ORD-004", table: "Table 8", items: 3, total: 67.50 * 2400, status: "preparing", time: "25 min ago" },
  { id: "#ORD-005", table: "Table 1", items: 5, total: 124.00 * 2400, status: "completed", time: "32 min ago" },
];

const statusStyles = {
  pending: "bg-warning/10 text-warning border-warning/20",
  preparing: "bg-primary/10 text-primary border-primary/20",
  served: "bg-success/10 text-success border-success/20",
  completed: "bg-muted text-muted-foreground border-border",
};

export function RecentOrders() {
  return (
    <div className="bg-card rounded-xl shadow-card border border-border/50 overflow-hidden">
      <div className="px-6 py-4 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">Recent Orders</h3>
      </div>
      <div className="divide-y divide-border">
        {orders.map((order) => (
          <div key={order.id} className="px-6 py-4 hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <p className="font-medium text-foreground">{order.id}</p>
                  <p className="text-sm text-muted-foreground">{order.table} • {order.items} items</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge className={cn("capitalize", statusStyles[order.status as keyof typeof statusStyles])}>
                  {order.status}
                </Badge>
                <div className="text-right">
                  <p className="font-semibold text-foreground">{order.total.toLocaleString('en-US', )}</p>
                  <p className="text-xs text-muted-foreground">{order.time}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
