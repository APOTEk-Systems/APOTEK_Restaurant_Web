import { TrendingUp } from "lucide-react";

const popularItems = [
  { name: "Grilled Salmon", orders: 156, revenue: 3588 * 2400, trend: "+12%" },
  { name: "Ribeye Steak", orders: 142, revenue: 4970 * 2400, trend: "+8%" },
  { name: "Caesar Salad", orders: 128, revenue: 1792 * 2400, trend: "+15%" },
  { name: "Margherita Pizza", orders: 118, revenue: 1770 * 2400, trend: "+5%" },
  { name: "Chicken Parmesan", orders: 98, revenue: 2156 * 2400, trend: "+3%" },
];

export function PopularItems() {
  return (
    <div className="bg-card rounded-xl shadow-card border border-border/50 overflow-hidden">
      <div className="px-6 py-4 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">Popular Items</h3>
        <p className="text-sm text-muted-foreground">Best selling items this week</p>
      </div>
      <div className="p-6 space-y-4">
        {popularItems.map((item, index) => (
          <div key={item.name} className="flex items-center gap-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary font-semibold text-sm">
              {index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">{item.name}</p>
              <p className="text-sm text-muted-foreground">{item.orders} orders</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-foreground">{item.revenue.toLocaleString('en-US',)}</p>
              <p className="text-sm text-success flex items-center justify-end gap-1">
                <TrendingUp className="h-3 w-3" />
                {item.trend}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
