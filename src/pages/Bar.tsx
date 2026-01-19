import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Wine, Clock, CheckCircle2, AlertCircle, GlassWater } from "lucide-react";
import { cn } from "@/lib/utils";

const barOrders = [
  { id: "BAR-001", table: "Table 5", items: ["Mojito", "Margarita"], status: "pending", time: "2 min ago", priority: "high" },
  { id: "BAR-002", table: "Table 12", items: ["House Red Wine", "Sparkling Water"], status: "in-progress", time: "5 min ago", priority: "normal" },
  { id: "BAR-003", table: "Bar Seat 3", items: ["Old Fashioned", "Whiskey Sour", "Gin & Tonic"], status: "pending", time: "1 min ago", priority: "high" },
  { id: "BAR-004", table: "Table 8", items: ["Cappuccino", "Espresso"], status: "ready", time: "8 min ago", priority: "normal" },
  { id: "BAR-005", table: "Table 2", items: ["Champagne (Bottle)", "Orange Juice"], status: "in-progress", time: "4 min ago", priority: "normal" },
  { id: "BAR-006", table: "Bar Seat 7", items: ["Craft IPA", "Pilsner"], status: "ready", time: "6 min ago", priority: "low" },
];

const inventory = [
  { name: "House Red Wine", stock: 24, unit: "bottles", status: "normal" },
  { name: "Vodka Premium", stock: 8, unit: "bottles", status: "low" },
  { name: "Fresh Limes", stock: 15, unit: "pieces", status: "low" },
  { name: "Simple Syrup", stock: 3, unit: "liters", status: "normal" },
  { name: "Tequila Blanco", stock: 2, unit: "bottles", status: "critical" },
  { name: "Craft IPA", stock: 48, unit: "cans", status: "normal" },
];

const statusStyles = {
  pending: "bg-warning/10 text-warning border-warning/20",
  "in-progress": "bg-primary/10 text-primary border-primary/20",
  ready: "bg-success/10 text-success border-success/20",
};

const statusIcons = {
  pending: Clock,
  "in-progress": AlertCircle,
  ready: CheckCircle2,
};

const inventoryStatusStyles = {
  normal: "text-success",
  low: "text-warning",
  critical: "text-destructive",
};

export default function Bar() {
  const pendingOrders = barOrders.filter(o => o.status === "pending").length;
  const inProgressOrders = barOrders.filter(o => o.status === "in-progress").length;
  const readyOrders = barOrders.filter(o => o.status === "ready").length;

  return (
    <MainLayout title="Bar" subtitle="Manage drink orders and bar inventory">
      <div className="space-y-6 animate-fade-in">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-warning/10">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-foreground">{pendingOrders}</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10">
                <GlassWater className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold text-foreground">{inProgressOrders}</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-success/10">
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ready</p>
                <p className="text-2xl font-bold text-foreground">{readyOrders}</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-accent">
                <Wine className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold text-foreground">{barOrders.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Orders Section */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="flex gap-3">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search orders..." className="pl-9" />
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="ready">Ready</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="gradient-primary text-primary-foreground shadow-glow hover:shadow-lg transition-shadow">
                <Plus className="h-4 w-4 mr-2" />
                New Order
              </Button>
            </div>

            {/* Orders Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {barOrders.map((order) => {
                const StatusIcon = statusIcons[order.status as keyof typeof statusIcons];
                return (
                  <div key={order.id} className={cn(
                    "bg-card rounded-xl p-5 shadow-card border hover:shadow-card-hover transition-all duration-300 hover-lift",
                    order.priority === "high" ? "border-warning/50" : "border-border/50"
                  )}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground">{order.id}</h3>
                          {order.priority === "high" && (
                            <Badge variant="outline" className="text-xs bg-warning/10 text-warning border-warning/20">
                              Priority
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{order.table}</p>
                      </div>
                      <Badge className={cn("capitalize", statusStyles[order.status as keyof typeof statusStyles])}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {order.status.replace("-", " ")}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-1">
                        {order.items.map((item, idx) => (
                          <span key={idx} className="text-xs bg-secondary px-2 py-1 rounded-md text-muted-foreground">
                            {item}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-border">
                        <span className="text-xs text-muted-foreground">{order.time}</span>
                        <div className="flex gap-2">
                          {order.status === "pending" && (
                            <Button size="sm" variant="outline" className="text-xs h-7">
                              Start
                            </Button>
                          )}
                          {order.status === "in-progress" && (
                            <Button size="sm" variant="outline" className="text-xs h-7 text-success border-success/50 hover:bg-success/10">
                              Ready
                            </Button>
                          )}
                          {order.status === "ready" && (
                            <Button size="sm" variant="outline" className="text-xs h-7 text-primary border-primary/50 hover:bg-primary/10">
                              Complete
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Inventory */}
          <div className="space-y-4">
            <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Wine className="h-4 w-4 text-primary" />
                Quick Inventory
              </h3>
              <div className="space-y-3">
                {inventory.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.stock} {item.unit}</p>
                    </div>
                    <span className={cn(
                      "text-xs font-medium capitalize",
                      inventoryStatusStyles[item.status as keyof typeof inventoryStatusStyles]
                    )}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                View Full Inventory
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
