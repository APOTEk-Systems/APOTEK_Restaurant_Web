import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Plus, Search, Eye, MoreHorizontal, CheckCircle2, Clock, AlertCircle, Package, Loader2, AlertCircle as AlertIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { goodsReceivingService, type GoodsReceiving } from "@/services/goodsReceivingService";
import { purchaseOrderService } from "@/services/purchaseOrderService";
import { format } from "date-fns";
import type { DateRange } from "@/components/ui/date-range-picker";

const statusStyles: Record<string, string> = {
  pending: "bg-warning/10 text-warning border-warning/20",
  partial: "bg-primary/10 text-primary border-primary/20",
  complete: "bg-success/10 text-success border-success/20",
  issue: "bg-destructive/10 text-destructive border-destructive/20",
};

const statusLabels: Record<string, string> = {
  pending: "Pending",
  partial: "Partial",
  complete: "Complete",
  issue: "Has Issues",
};

const statusIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  pending: Clock,
  partial: Package,
  complete: CheckCircle2,
  issue: AlertIcon,
};

export default function GoodsReceiving() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const queryClient = useQueryClient();

  // Fetch goods receiving records using React Query with date range
  const { data: receivings = [], isLoading, isError, error } = useQuery({
    queryKey: ["goodsReceiving", dateRange?.from, dateRange?.to],
    queryFn: () => {
      const startDate = dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined;
      const endDate = dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined;
      return goodsReceivingService.getAllGoodsReceiving(startDate, endDate);
    },
  });

  // Fetch purchase orders for partial receiving functionality
  const { data: purchaseOrders = [] } = useQuery({
    queryKey: ["purchaseOrders", dateRange?.from, dateRange?.to],
    queryFn: () => {
      const startDate = dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined;
      const endDate = dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined;
      return purchaseOrderService.getAllPurchaseOrders(startDate, endDate);
    },
  });

  // Filter records based on search and status
  const filteredReceivings = useMemo(() => {
    return receivings.filter((receiving: GoodsReceiving) => {
      const matchesSearch = receiving.grnNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            receiving.supplier?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            receiving.purchaseOrder?.poNumber?.toLowerCase().includes(searchQuery.toLowerCase());
      // Determine status based on items
      const status = determineStatus(receiving);
      const matchesStatus = selectedStatus === "all" || status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [receivings, searchQuery, selectedStatus]);

  // Calculate stats
  const totalReceived = receivings.length;
  const pendingCount = receivings.filter((r: GoodsReceiving) => determineStatus(r) === "pending").length;
  const partialCount = receivings.filter((r: GoodsReceiving) => determineStatus(r) === "partial").length;
  const completeCount = receivings.filter((r: GoodsReceiving) => determineStatus(r) === "complete").length;

  // Determine status based on receiving details
  function determineStatus(receiving: GoodsReceiving): string {
    if (!receiving.receivedItems || receiving.receivedItems.length === 0) {
      return "pending";
    }
    
    // Check if all items were received (could be enhanced with actual quantity comparison)
    const hasItems = receiving.receivedItems.length > 0;
    if (!hasItems) return "pending";
    
    // For now, assume if it has items it's complete or partial
    // In a real app, you'd compare received quantity vs ordered quantity
    return "complete";
  }

  return (
    <MainLayout title="Goods Received" subtitle="Track and manage incoming deliveries">
      <div className="space-y-6 animate-fade-in">
        {/* Stats */}
        {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
            <p className="text-sm text-muted-foreground">Total Received</p>
            <p className="text-2xl font-bold text-foreground mt-1">{isLoading ? "..." : totalReceived}</p>
            <p className="text-xs text-success mt-1">This month</p>
          </div>
          <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold text-warning mt-1">{isLoading ? "..." : pendingCount}</p>
            <p className="text-xs text-muted-foreground mt-1">Awaiting delivery</p>
          </div>
          <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
            <p className="text-sm text-muted-foreground">Partial Deliveries</p>
            <p className="text-2xl font-bold text-primary mt-1">{isLoading ? "..." : partialCount}</p>
            <p className="text-xs text-muted-foreground mt-1">Incomplete orders</p>
          </div>
          <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
            <p className="text-sm text-muted-foreground">Complete</p>
            <p className="text-2xl font-bold text-success mt-1">{isLoading ? "..." : completeCount}</p>
            <p className="text-xs text-muted-foreground mt-1">Fully received</p>
          </div>
        </div> */}

        {/* Actions Bar */}
        <div className="flex sm:flex-row gap-4">
          <div className="flex gap-3 w-full flex-wrap">
        
            <div className="relative flex-1 sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by GRN, PO or supplier..." 
                className="pl-9" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
                <DateRangePicker
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              className="w-auto"
            />
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="complete">Complete</SelectItem>
                <SelectItem value="issue">Has Issues</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Error State */}
        {isError && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex items-center gap-3">
            <AlertIcon className="h-5 w-5 text-destructive" />
            <p className="text-destructive">Failed to load goods receiving records: {error instanceof Error ? error.message : "Unknown error"}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Loading goods receiving records...</span>
          </div>
        ) : (
          /* Receiving Table */
          <div className="bg-card rounded-xl shadow-card border border-border/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                   
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Order #</th>
                  
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Received Date</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Supplier</th>
                       <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Received By</th>
                    {/* <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Status</th> */}
                    <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredReceivings.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                        No goods receiving records found.
                      </td>
                    </tr>
                  ) : (
                    filteredReceivings.map((receiving: GoodsReceiving) => {
                      const status = determineStatus(receiving);
                      const StatusIcon = statusIcons[status] || Clock;
                      
                      return (
                        <tr key={receiving.id} className="hover:bg-muted/30 transition-colors">
                          {/* <td className="px-6 py-4 font-medium text-foreground">{receiving.grnNumber}</td> */}
                          <td className="px-6 py-4 text-primary font-medium">
                            {receiving.purchaseOrder?.poNumber || "-"}
                          </td>
                           <td className="px-6 py-4 text-muted-foreground">
                            {receiving.receivedAt ? new Date(receiving.receivedAt).toLocaleDateString() : "-"}
                          </td>
                          <td className="px-6 py-4 text-foreground">{receiving.supplier?.name || "-"}</td>
                                                   <td className="px-6 py-4 text-foreground">{"-"}</td>

                          {/* <td className="px-6 py-4">
                            <Badge className={cn("capitalize", statusStyles[status])}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusLabels[status]}
                            </Badge>
                          </td> */}
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <Link to={`/purchases/receiving/view/${receiving.id}`}>
                                <Button variant="outline" size="icon" className="w-full p-2">
                                  <Eye className="h-4 w-4" />
                                  <span>View</span>
                                </Button>
                              </Link>
                             
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
