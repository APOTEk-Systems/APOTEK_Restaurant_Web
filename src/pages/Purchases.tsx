import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Eye, Truck, Package, FileText, Loader2, AlertCircle, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { purchaseOrderService, type PurchaseOrder } from "@/services/purchaseOrderService";

const statusStyles: Record<string, string> = {
  pending: "bg-warning/10 text-warning border-warning/20",
  "in-transit": "bg-primary/10 text-primary border-primary/20",
  delivered: "bg-success/10 text-success border-success/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
  APPROVED: "bg-success/10 text-success border-success/20",
  ORDERED: "bg-primary/10 text-primary border-primary/20",
  PARTIALLY_RECEIVED: "bg-primary/10 text-primary border-primary/20",
  COMPLETED: "bg-success/10 text-success border-success/20",
  CANCELLED: "bg-destructive/10 text-destructive border-destructive/20",
};

const statusLabels: Record<string, string> = {
  pending: "Pending",
  "in-transit": "In Transit",
  delivered: "Delivered",
  cancelled: "Cancelled",
  APPROVED: "Approved",
  ORDERED: "Ordered",
  PARTIALLY_RECEIVED: "Partially Received",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const statusIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  pending: FileText,
  "in-transit": Truck,
  delivered: Package,
  cancelled: FileText,
  APPROVED: Check,
  ORDERED: Truck,
  PARTIALLY_RECEIVED: Package,
  COMPLETED: Check,
  CANCELLED: X,
};

export default function Purchases() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const queryClient = useQueryClient();

  // Fetch purchase orders using React Query
  const { data: purchaseOrders = [], isLoading, isError, error } = useQuery({
    queryKey: ["purchaseOrders"],
    queryFn: purchaseOrderService.getAllPurchaseOrders,
  });

  // Filter purchase orders based on search and status
  const filteredOrders = purchaseOrders.filter((po: PurchaseOrder) => {
    const matchesSearch = po.poNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          po.supplier?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === "all" || po.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const totalOrders = purchaseOrders.length;
  const pendingOrders = purchaseOrders.filter((po: PurchaseOrder) => po.status === "PENDING").length;
  const inTransitOrders = purchaseOrders.filter((po: PurchaseOrder) => 
    po.status === "ORDERED" || po.status === "PARTIALLY_RECEIVED"
  ).length;
  const totalSpent = purchaseOrders.reduce((sum: number, po: PurchaseOrder) => {
    const poTotal = po.items.reduce((itemSum: number, item: any) => 
      itemSum + (item.quantityOrdered * item.unitPrice), 0
    );
    return sum + poTotal;
  }, 0);

  return (
    <MainLayout title="Purchases" subtitle="Manage supplier orders and deliveries">
      <div className="space-y-6 animate-fade-in">
        {/* Stats */}
        {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
            <p className="text-sm text-muted-foreground">Total Orders</p>
            <p className="text-2xl font-bold text-foreground mt-1">{isLoading ? "..." : totalOrders}</p>
            <p className="text-xs text-success mt-1">This month</p>
          </div>
          <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold text-warning mt-1">{isLoading ? "..." : pendingOrders}</p>
            <p className="text-xs text-muted-foreground mt-1">Awaiting approval</p>
          </div>
          <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
            <p className="text-sm text-muted-foreground">In Transit</p>
            <p className="text-2xl font-bold text-primary mt-1">{isLoading ? "..." : inTransitOrders}</p>
            <p className="text-xs text-muted-foreground mt-1">On the way</p>
          </div>
          <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
            <p className="text-sm text-muted-foreground">Total Spent</p>
            <p className="text-2xl font-bold text-foreground mt-1">
              {isLoading ? "..." : `$${totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </p>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </div>
        </div> */}

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-3">
            <div className="relative flex-1 sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search purchases..." 
                className="pl-9" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="ORDERED">Ordered</SelectItem>
                <SelectItem value="PARTIALLY_RECEIVED">Partially Received</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Link to="/purchases/new">
            <Button className="gradient-primary text-primary-foreground shadow-glow hover:shadow-lg transition-shadow">
              <Plus className="h-4 w-4 mr-2" />
              New Purchase Order
            </Button>
          </Link>
        </div>

        {/* Error State */}
        {isError && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <p className="text-destructive">Failed to load purchase orders: {error instanceof Error ? error.message : "Unknown error"}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Loading purchase orders...</span>
          </div>
        ) : (
          /* Purchases Table */
          <div className="bg-card rounded-xl shadow-card border border-border/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Order ID</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Supplier</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Items</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Order Date</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Total</th>
                    <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                        No purchase orders found.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((purchaseOrder: PurchaseOrder) => {
                      const StatusIcon = statusIcons[purchaseOrder.status] || FileText;
                      const orderTotal = purchaseOrder.items.reduce((sum: number, item: any) => 
                        sum + (item.quantityOrdered * item.unitPrice), 0
                      );
                      
                      return (
                        <tr key={purchaseOrder.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-6 py-4 font-medium text-foreground">{purchaseOrder.poNumber}</td>
                          <td className="px-6 py-4 text-foreground">{purchaseOrder.supplier?.name || `Supplier #${purchaseOrder.supplierId}`}</td>
                          <td className="px-6 py-4 text-foreground">{purchaseOrder.items.length} items</td>
                          <td className="px-6 py-4 text-muted-foreground">
                            {purchaseOrder.orderedAt ? new Date(purchaseOrder.orderedAt).toLocaleDateString() : "-"}
                          </td>
                          <td className="px-6 py-4">
                            <Badge className={cn("capitalize", statusStyles[purchaseOrder.status] || statusStyles.pending)}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusLabels[purchaseOrder.status] || purchaseOrder.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 font-semibold text-foreground">
                            ${orderTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                <Link to={`/purchases/${purchaseOrder.id}`}>
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
