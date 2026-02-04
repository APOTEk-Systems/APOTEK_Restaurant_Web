import { TrendingUp } from "lucide-react";
import { Loader2 } from "lucide-react";

interface PopularItemsProps {
  orders: any[];
  isLoading: boolean;
}

export function PopularItems({ orders = [], isLoading }: PopularItemsProps) {
  // Calculate popular items from order data
  const calculatePopularItems = () => {
    const itemCounts: Record<string, { name: string; quantity: number; revenue: number }> = {};
    
    orders.forEach((order: any) => {
      if (order.orderItems) {
        order.orderItems.forEach((item: any) => {
          const itemName = item.menuItem?.name || `Item #${item.menuItemId}`;
          if (!itemCounts[itemName]) {
            itemCounts[itemName] = { name: itemName, quantity: 0, revenue: 0 };
          }
          itemCounts[itemName].quantity += item.quantity || 1;
          itemCounts[itemName].revenue += (item.price || 0) * (item.quantity || 1);
        });
      }
    });
    
    // Convert to array and sort by quantity
    const sortedItems = Object.values(itemCounts)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
    
    return sortedItems;
  };

  const popularItems = isLoading ? [] : calculatePopularItems();

  return (
    <div className="bg-card rounded-xl shadow-card border border-border/50 overflow-hidden">
      <div className="px-6 py-4 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">Popular Items</h3>
        <p className="text-sm text-muted-foreground">Best selling items this week</p>
      </div>
      {isLoading ? (
        <div className="p-12 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : popularItems.length === 0 ? (
        <div className="p-12 text-center text-muted-foreground">
          No data available
        </div>
      ) : (
        <div className="p-6 space-y-4">
          {popularItems.map((item, index) => (
            <div key={item.name} className="flex items-center gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary font-semibold text-sm">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{item.name}</p>
                <p className="text-sm text-muted-foreground">{item.quantity} orders</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-foreground">TZS {item.revenue.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
