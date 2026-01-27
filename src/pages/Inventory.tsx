import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Package, AlertTriangle, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { InventoryService } from "@/services/inventoryService";

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
  const { data: inventoryItems = [], isLoading, error } = useQuery({
    queryKey: ['inventoryItems'],
    queryFn: InventoryService.getAllInventoryItems,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['inventoryCategories'],
    queryFn: InventoryService.getAllInventoryCategories,
  });

  const lowStockItems = inventoryItems.filter((item: { status: string }) => item.status.toLocaleLowerCase() !== "normal").length;

  const getStatus = (item: { quantity: number; minStock: number }) => {
    if (item.quantity <= item.minStock * 0.5) return "critical";
    if (item.quantity <= item.minStock) return "low";
    return "normal";
  };

  if (isLoading) {
    return (
      <MainLayout title="Inventory" subtitle="Track and manage your stock levels">
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading inventory...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout title="Inventory" subtitle="Track and manage your stock levels">
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-center h-64">
            <p className="text-destructive">Error loading inventory data</p>
          </div>
        </div>
      </MainLayout>
    );
  }

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
                <p className="text-2xl font-bold text-foreground">{categories.length}</p>
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
                {categories.map((category: { id: number; name: string }) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    <>{category.name}</>
                  </SelectItem>
                ))}
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
              <TableHead className="text-right">Unit Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventoryItems.map((item: { id: number; name: string; category?: { name: string }; unit: string; quantity: number; minStock: number; maxStock: number; price: number; status: string; storageLocation: string | null }) => {
              const status = getStatus(item);
              const StatusIcon = statusIcons[status as keyof typeof statusIcons];
              const percentage = (item.quantity / item.maxStock) * 100;

              return (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="font-medium text-foreground">{item.name}</div>
                  
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">{item.category?.name || 'N/A'}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-foreground">{item.quantity} {item.unit}{item.quantity > 1 ? "s" :""}</div>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn("capitalize", statusStyles[status as keyof typeof statusStyles])}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-primary text-right">{item.price.toLocaleString('en-US', { })}</div>
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
