import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Package, AlertTriangle, TrendingDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { InventoryService, type InventoryItem, type InventoryCategory } from "@/services/inventoryService";

const statusStyles: Record<string, string> = {
  NORMAL: "bg-success/10 text-success border-success/20",
  LOW: "bg-warning/10 text-warning border-warning/20",
  CRITICAL: "bg-destructive/10 text-destructive border-destructive/20",
  normal: "bg-success/10 text-success border-success/20",
  low: "bg-warning/10 text-warning border-warning/20",
  critical: "bg-destructive/10 text-destructive border-destructive/20",
};

const statusIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  NORMAL: Package,
  LOW: TrendingDown,
  CRITICAL: AlertTriangle,
  normal: Package,
  low: TrendingDown,
  critical: AlertTriangle,
};

// Helper to get status from inventory item
const getItemStatus = (item: InventoryItem): string => {
  if (item.status) return item.status;
  
  if (item.quantity <= 0) return "CRITICAL";
  if (item.minStock && item.quantity <= item.minStock) {
    return item.quantity <= item.minStock * 0.5 ? "CRITICAL" : "LOW";
  }
  return "NORMAL";
};

export default function Inventory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Fetch inventory items using React Query
  const { 
    data: itemsData = [], 
    isLoading: isLoadingItems, 
    error: itemsError 
  } = useQuery<InventoryItem[], Error>({
    queryKey: ['inventoryItems'],
    queryFn: InventoryService.getAllItems,
  });

  // Fetch categories using React Query
  const { 
    data: categoriesData = [], 
    isLoading: isLoadingCategories 
  } = useQuery<InventoryCategory[], Error>({
    queryKey: ['inventoryCategories'],
    queryFn: InventoryService.getAllCategories,
  });

  const isLoading = isLoadingItems || isLoadingCategories;

  // Get unique categories from data
  const categories = categoriesData;
  const categoryNames = useMemo(() => {
    const names = new Set(itemsData.map(item => item.category?.name).filter(Boolean));
    return Array.from(names);
  }, [itemsData]);

  // Filter items based on search and category
  const filteredItems = useMemo(() => {
    return itemsData.filter(item => {
      const matchesSearch = 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = 
        selectedCategory === "all" || 
        item.category?.name?.toLowerCase() === selectedCategory.toLowerCase();
      return matchesSearch && matchesCategory;
    });
  }, [itemsData, searchQuery, selectedCategory]);

  // Calculate stats
  const lowStockItems = itemsData.filter(item => {
    const status = getItemStatus(item);
    return status === "LOW" || status === "CRITICAL";
  });

  return (
    <MainLayout title="Inventory" subtitle="Track and manage your stock levels">
      <div className="space-y-6 animate-fade-in">
        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Loading inventory...</span>
          </div>
        ) : itemsError ? (
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
            <p className="font-medium">Error loading inventory</p>
            <p className="mt-2 text-sm">{itemsError.message}</p>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Items</p>
                    <p className="text-2xl font-bold text-foreground">{itemsData.length}</p>
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
                    <p className="text-2xl font-bold text-foreground">{lowStockItems.length}</p>
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
                    <p className="text-2xl font-bold text-foreground">{categoryNames.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="flex gap-3">
                <div className="relative flex-1 sm:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search inventory..." 
                    className="pl-9" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.name.toLowerCase()}>
                        {cat.name}
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
                  <TableHead>Departments</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Unit Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      No inventory items found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item) => {
                    const status = getItemStatus(item);
                    const StatusIcon = statusIcons[status] || Package;
                    const percentage = item.maxStock ? (item.quantity / item.maxStock) * 100 : 0;

                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="font-medium text-foreground">{item.name}</div>
                          {item.sku && (
                            <div className="text-xs text-muted-foreground">{item.sku}</div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">{item.category?.name || "Uncategorized"}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {item.department?.map((dept) => (
                              <Badge key={dept} variant="outline" className="text-xs">
                                {dept.charAt(0) + dept.slice(1).toLowerCase()}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium text-foreground">
                              {item.quantity} {item.unit}
                            </div>
                            {item.maxStock && (
                              <Progress value={percentage} className="h-1 w-20" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={cn("capitalize", statusStyles[status] || statusStyles.NORMAL)}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {status.toLowerCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold text-primary">
                            {item.price.toLocaleString('en-US')} TZS/{item.unit}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </>
        )}
      </div>
    </MainLayout>
  );
}
