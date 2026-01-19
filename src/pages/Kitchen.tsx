import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, CheckCircle2, AlertCircle, Flame, Timer, ChefHat, UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils";

const kitchenOrders = [
  { 
    id: "KIT-001", 
    table: "Table 3", 
    items: [
      { name: "Grilled Salmon", mods: "No sauce", qty: 1 },
      { name: "Caesar Salad", mods: "Dressing on side", qty: 1 },
    ], 
    status: "cooking", 
    time: "8 min", 
    priority: "normal",
    course: "Main"
  },
  { 
    id: "KIT-002", 
    table: "Table 7", 
    items: [
      { name: "Ribeye Steak", mods: "Medium rare", qty: 2 },
      { name: "Mashed Potatoes", mods: "", qty: 2 },
      { name: "Grilled Asparagus", mods: "", qty: 2 },
    ], 
    status: "pending", 
    time: "2 min", 
    priority: "high",
    course: "Main"
  },
  { 
    id: "KIT-003", 
    table: "Table 12", 
    items: [
      { name: "Mushroom Risotto", mods: "Extra parmesan", qty: 1 },
    ], 
    status: "ready", 
    time: "15 min", 
    priority: "normal",
    course: "Main"
  },
  { 
    id: "KIT-004", 
    table: "Table 1", 
    items: [
      { name: "French Onion Soup", mods: "", qty: 2 },
      { name: "Bruschetta", mods: "", qty: 1 },
    ], 
    status: "pending", 
    time: "1 min", 
    priority: "high",
    course: "Appetizer"
  },
  { 
    id: "KIT-005", 
    table: "Table 9", 
    items: [
      { name: "Tiramisu", mods: "", qty: 2 },
      { name: "Crème Brûlée", mods: "", qty: 1 },
    ], 
    status: "cooking", 
    time: "5 min", 
    priority: "normal",
    course: "Dessert"
  },
  { 
    id: "KIT-006", 
    table: "Table 4", 
    items: [
      { name: "Margherita Pizza", mods: "Well done", qty: 1 },
      { name: "Garlic Bread", mods: "", qty: 1 },
    ], 
    status: "ready", 
    time: "12 min", 
    priority: "normal",
    course: "Main"
  },
];

const statusStyles = {
  pending: "bg-warning/10 text-warning border-warning/20",
  cooking: "bg-primary/10 text-primary border-primary/20",
  ready: "bg-success/10 text-success border-success/20",
};

const statusIcons = {
  pending: Clock,
  cooking: Flame,
  ready: CheckCircle2,
};

const courseColors = {
  Appetizer: "bg-accent text-accent-foreground",
  Main: "bg-primary/10 text-primary",
  Dessert: "bg-pink-500/10 text-pink-500",
};

export default function Kitchen() {
  const pendingOrders = kitchenOrders.filter(o => o.status === "pending").length;
  const cookingOrders = kitchenOrders.filter(o => o.status === "cooking").length;
  const readyOrders = kitchenOrders.filter(o => o.status === "ready").length;
  const totalItems = kitchenOrders.reduce((sum, order) => sum + order.items.reduce((s, i) => s + i.qty, 0), 0);

  return (
    <MainLayout title="Kitchen" subtitle="Manage food orders and kitchen workflow">
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
                <Flame className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cooking</p>
                <p className="text-2xl font-bold text-foreground">{cookingOrders}</p>
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
                <UtensilsCrossed className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold text-foreground">{totalItems}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3">
          <Select defaultValue="all">
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="cooking">Cooking</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Course" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              <SelectItem value="appetizer">Appetizer</SelectItem>
              <SelectItem value="main">Main</SelectItem>
              <SelectItem value="dessert">Dessert</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Orders Grid - Kitchen Display Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {kitchenOrders.map((order) => {
            const StatusIcon = statusIcons[order.status as keyof typeof statusIcons];
            return (
              <div key={order.id} className={cn(
                "bg-card rounded-xl shadow-card border hover:shadow-card-hover transition-all duration-300",
                order.priority === "high" ? "border-warning ring-2 ring-warning/20" : "border-border/50",
                order.status === "ready" && "border-success/50"
              )}>
                {/* Header */}
                <div className={cn(
                  "px-4 py-3 rounded-t-xl flex items-center justify-between",
                  order.status === "pending" && "bg-warning/5",
                  order.status === "cooking" && "bg-primary/5",
                  order.status === "ready" && "bg-success/5"
                )}>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-foreground">{order.id}</h3>
                    {order.priority === "high" && (
                      <AlertCircle className="h-4 w-4 text-warning animate-pulse" />
                    )}
                  </div>
                  <Badge className={cn("capitalize", statusStyles[order.status as keyof typeof statusStyles])}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {order.status}
                  </Badge>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{order.table}</span>
                    <Badge variant="outline" className={cn("text-xs", courseColors[order.course as keyof typeof courseColors])}>
                      {order.course}
                    </Badge>
                  </div>

                  {/* Items */}
                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="bg-secondary/50 rounded-lg p-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm text-foreground">
                            {item.qty}x {item.name}
                          </span>
                        </div>
                        {item.mods && (
                          <p className="text-xs text-warning mt-1 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {item.mods}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Timer className="h-3.5 w-3.5" />
                      <span className="text-xs">{order.time}</span>
                    </div>
                    <div className="flex gap-2">
                      {order.status === "pending" && (
                        <Button size="sm" className="text-xs h-7 gradient-primary text-primary-foreground">
                          <Flame className="h-3 w-3 mr-1" />
                          Start
                        </Button>
                      )}
                      {order.status === "cooking" && (
                        <Button size="sm" variant="outline" className="text-xs h-7 text-success border-success/50 hover:bg-success/10">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Ready
                        </Button>
                      )}
                      {order.status === "ready" && (
                        <Button size="sm" variant="outline" className="text-xs h-7 text-primary border-primary/50 hover:bg-primary/10">
                          <ChefHat className="h-3 w-3 mr-1" />
                          Served
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
    </MainLayout>
  );
}
