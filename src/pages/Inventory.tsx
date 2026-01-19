import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Package, AlertTriangle, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";

const inventoryItems = [
  { id: 1, name: "Fresh Salmon", category: "Seafood", quantity: 25, unit: "lbs", minStock: 30, maxStock: 100, price: 15.00 * 2400, unitPrice: "TZS/lb", status: "low" },
  { id: 2, name: "Ribeye Steak", category: "Meat", quantity: 45, unit: "lbs", minStock: 20, maxStock: 80, price: 28.00 * 2400, unitPrice: "TZS/lb", status: "normal" },
  { id: 3, name: "Romaine Lettuce", category: "Vegetables", quantity: 8, unit: "heads", minStock: 15, maxStock: 50, price: 2.50 * 2400, unitPrice: "TZS/head", status: "critical" },
  { id: 4, name: "Parmesan Cheese", category: "Dairy", quantity: 12, unit: "lbs", minStock: 10, maxStock: 40, price: 18.00 * 2400, unitPrice: "TZS/lb", status: "normal" },
  { id: 5, name: "Olive Oil", category: "Pantry", quantity: 5, unit: "gal", minStock: 8, maxStock: 25, price: 35.00 * 2400, unitPrice: "TZS/gal", status: "low" },
  { id: 6, name: "House Red Wine", category: "Beverages", quantity: 48, unit: "bottles", minStock: 24, maxStock: 100, price: 12.00 * 2400, unitPrice: "TZS/bottle", status: "normal" },
  { id: 7, name: "Chicken Breast", category: "Meat", quantity: 35, unit: "lbs", minStock: 25, maxStock: 80, price: 8.00 * 2400, unitPrice: "TZS/lb", status: "normal" },
  { id: 8, name: "Heavy Cream", category: "Dairy", quantity: 6, unit: "qt", minStock: 10, maxStock: 30, price: 5.00 * 2400, unitPrice: "TZS/qt", status: "low" },
];

const statusStyles = {
  normal: "bg-success/10 text-success border-success/20",
  low: "bg-warning/10 text-warning border-warning/20",
  critical: "bg-destructive/10 text-destructive border-destructive/20",
};

const statusIcons = {
  normal: Package,
  low: TrendingDown,
  critical: AlertTriangle,
};

export default function Inventory() {
  const lowStockItems = inventoryItems.filter(item => item.status !== "normal").length;

  return (
    <MainLayout title="Inventory" subtitle="Track and manage your stock levels">
      <div className="space-y-6 animate-fade-in">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold text-foreground">{inventoryItems.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-warning/10">
                <AlertTriangle className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Low Stock Alerts</p>
                <p className="text-2xl font-bold text-foreground">{lowStockItems}</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-success/10">
                <TrendingDown className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Categories</p>
                <p className="text-2xl font-bold text-foreground">6</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-3">
            <div className="relative flex-1 sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search inventory..." className="pl-9" />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="meat">Meat</SelectItem>
                <SelectItem value="seafood">Seafood</SelectItem>
                <SelectItem value="vegetables">Vegetables</SelectItem>
                <SelectItem value="dairy">Dairy</SelectItem>
                <SelectItem value="pantry">Pantry</SelectItem>
                <SelectItem value="beverages">Beverages</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Link to="/inventory/new">
            <Button className="gradient-primary text-primary-foreground shadow-glow hover:shadow-lg transition-shadow">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </Link>
        </div>

        {/* Inventory Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Current Stock</TableHead>
              <TableHead>Status</TableHead>
              {/* <TableHead>Stock Range</TableHead> */}
              <TableHead>Unit Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventoryItems.map((item) => {
              const StatusIcon = statusIcons[item.status as keyof typeof statusIcons];
              const percentage = (item.quantity / item.maxStock) * 100;

              return (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="font-medium text-foreground">{item.name}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">{item.category}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-foreground">{item.quantity} {item.unit}</div>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn("capitalize", statusStyles[item.status as keyof typeof statusStyles])}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {item.status}
                    </Badge>
                  </TableCell>
                  
                  <TableCell>
                    <div className="font-semibold text-primary">{item.price.toLocaleString('en-US', )} {item.unitPrice}</div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </MainLayout>
  );
}
