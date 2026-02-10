import { useState, lazy, Suspense } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { inventoryAdjustmentService, type InventoryAdjustment } from "@/services/inventoryAdjustmentService";
import { DateRangePicker, type DateRange } from "@/components/ui/date-range-picker";

const AdjustmentDialog = lazy(() => import("@/components/inventory-adjustments/AdjustmentDialog").then(module => ({ default: module.AdjustmentDialog })));

const typeStyles = {
  increase: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  decrease: "bg-red-500/10 text-red-500 border-red-500/20",
};

export default function InventoryAdjustments() {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Initialize with today's date range (start of day to end of day, timezone-independent)
  const today = new Date();
  const startOfDay = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 0, 0, 0, 0));
  const endOfDay = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 23, 59, 59, 999));
  
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfDay,
    to: endOfDay,
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch adjustments with date range filter
  const { data: adjustments = [] as InventoryAdjustment[], isLoading } = useQuery({
    queryKey: ["inventoryAdjustments", dateRange],
    queryFn: () => inventoryAdjustmentService.getAllInventoryAdjustments({
      fromDate: dateRange?.from ? dateRange.from.toISOString() : undefined,
      toDate: dateRange?.to ? dateRange.to.toISOString() : undefined,
    }),
  });

  // Calculate stats
  // The 'todayAdjustments' variable was calculated but not used in the original code,
  // so it's being removed to reduce unnecessary computation.
  // const todayAdjustments = adjustments.filter((adj: InventoryAdjustment) => {
  //   const today = new Date().toDateString();
  //   return new Date(adj.createdAt).toDateString() === today;
  // });

  // Filter adjustments based on search
  const filteredAdjustments = adjustments.filter((adj: InventoryAdjustment) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      adj.adjustmentNumber?.toLowerCase().includes(searchLower) ||
      adj.inventoryItem?.name?.toLowerCase().includes(searchLower) ||
      adj.adjustmentReason?.name?.toLowerCase().includes(searchLower) ||
      adj.adjustedBy?.toLowerCase().includes(searchLower) ||
      adj.batch?.batchNumber?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <MainLayout title="Stock Adjustments" subtitle="Track and manage stock level changes">
      <div className="space-y-6">
        {/* Action Button */}
        <div className="flex flex-row-reverse items-center">
          <Suspense fallback={<Button disabled><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Loading...</Button>}>
            <AdjustmentDialog isDialogOpen={isDialogOpen} onOpenChange={setIsDialogOpen} />
          </Suspense>

           {/* Search and Filters */}
        <div className="flex items-center gap-4 w-full">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search adjustments..."
              className="pl-9 glass-card"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <DateRangePicker
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            className="mr-2"
          />
         
        </div>
        </div>

       


        {/* Adjustments List */}
        <Card className="glass-card">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-3 text-muted-foreground">Loading adjustments...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Item</th>
                       <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                        Quantity
                      </th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Date</th>
                                         
                      {/* <th className="text-left p-4 text-sm font-medium text-muted-foreground">Batch</th> */}
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Reason</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                        Adjusted By
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAdjustments.length === 0 ? (
                      <tr>
                        <td
                          colSpan={8}
                          className="p-12 text-center text-muted-foreground"
                        >
                          No adjustments found.
                        </td>
                      </tr>
                    ) : (
                      filteredAdjustments.map((adjustment: InventoryAdjustment) => (
                        <tr
                          key={adjustment.id}
                          className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                        >
                          <td className="p-4 text-sm text-foreground">
                            {adjustment.inventoryItem?.name || `Item #${adjustment.inventoryItemId}`}
                          </td>
                           <td className="p-4 text-sm font-medium">
                            <span
                              className={
                                adjustment.adjustmentType === "decrease"
                                  ? "text-red-500"
                                  : "text-emerald-500"
                              }
                            >
                              {adjustment.adjustmentType === "decrease" ? "-" : "+"}
                              {adjustment.quantity}
                            </span>
                          </td>
                          <td className="p-4 text-sm text-muted-foreground">
                            {new Date(adjustment.createdAt).toLocaleDateString()}
                          </td>
                         
                     
                          <td className="p-4 text-sm text-muted-foreground">
                            {adjustment.adjustmentReason?.name || "-"}
                          </td>
                          <td className="p-4 text-sm text-muted-foreground">
                            {adjustment.adjustedBy || "-"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
