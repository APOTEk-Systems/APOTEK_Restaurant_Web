import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, ArrowUp, ArrowDown, Loader2, Package } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryAdjustmentService, type InventoryAdjustment } from "@/services/inventoryAdjustmentService";
import { adjustmentReasonService, type AdjustmentReason } from "@/services/adjustmentReasonService";
import { inventoryItemService, type InventoryItem } from "@/services/inventoryItemService";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { batchService, type Batch } from "@/services/batchService";

const typeStyles = {
  increase: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  decrease: "bg-red-500/10 text-red-500 border-red-500/20",
};

export default function InventoryAdjustments() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    inventoryItemId: "",
    batchId: "general",
    adjustmentReasonId: "",
    adjustmentType: "decrease" as "increase" | "decrease",
    quantity: "",
    notes: "",
  });

  const queryClient = useQueryClient();

  // Fetch adjustments
  const { data: adjustments = [] as InventoryAdjustment[], isLoading } = useQuery({
    queryKey: ["inventoryAdjustments"],
    queryFn: () => inventoryAdjustmentService.getAllInventoryAdjustments(),
  });

  // Fetch inventory items for dropdown
  const { data: inventoryItems = [] } = useQuery({
    queryKey: ["inventoryItems"],
    queryFn: () => inventoryItemService.getAllInventoryItems(),
  });

  // Fetch adjustment reasons for dropdown
  const { data: adjustmentReasons = [] } = useQuery({
    queryKey: ["adjustmentReasons"],
    queryFn: adjustmentReasonService.getAllAdjustmentReasons,
  });

  // Fetch batches for selected inventory item
  const { data: batches = [] } = useQuery({
    queryKey: ["batches", formData.inventoryItemId],
    queryFn: () => formData.inventoryItemId ? batchService.getBatchesByItem(parseInt(formData.inventoryItemId)) : Promise.resolve([]),
    enabled: !!formData.inventoryItemId,
  });

  // Filter reasons based on adjustment type
  const filteredReasons = adjustmentReasons.filter((reason: AdjustmentReason) => {
    if (formData.adjustmentType === "increase") {
      return reason.type === "increase" || reason.type === "both";
    }
    return reason.type === "decrease" || reason.type === "both";
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: typeof formData) =>
      inventoryAdjustmentService.createInventoryAdjustment({
        inventoryItemId: parseInt(data.inventoryItemId),
        adjustmentReasonId: parseInt(data.adjustmentReasonId),
        adjustmentType: data.adjustmentType,
        quantity: parseFloat(data.quantity),
        notes: data.notes || undefined,
        ...(data.batchId && data.batchId !== "general" && { batchId: parseInt(data.batchId) }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventoryAdjustments"] });
      queryClient.invalidateQueries({ queryKey: ["inventoryItems"] });
      queryClient.invalidateQueries({ queryKey: ["batches"] });
      toast.success("Inventory adjustment created successfully");
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create inventory adjustment");
    },
  });

  // Get selected inventory item
  const selectedItem = inventoryItems.find(
    (item: InventoryItem) => item.id === parseInt(formData.inventoryItemId)
  );

  // Get selected batch
  const selectedBatch = batches.find(
    (batch: Batch) => batch.id === parseInt(formData.batchId)
  );

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setFormData({
      inventoryItemId: "",
      batchId: "general",
      adjustmentReasonId: "",
      adjustmentType: "decrease",
      quantity: "",
      notes: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.inventoryItemId || !formData.adjustmentReasonId || !formData.quantity) {
      toast.error("Please fill in all required fields");
      return;
    }
    createMutation.mutate(formData);
  };

  // Calculate stats
  const todayAdjustments = adjustments.filter((adj: InventoryAdjustment) => {
    const today = new Date().toDateString();
    return new Date(adj.createdAt).toDateString() === today;
  });

  const totalIncreases = todayAdjustments
    .filter((adj: InventoryAdjustment) => adj.adjustmentType === "increase")
    .reduce((sum: number, adj: InventoryAdjustment) => sum + adj.quantity, 0);

  const totalDecreases = todayAdjustments
    .filter((adj: InventoryAdjustment) => adj.adjustmentType === "decrease")
    .reduce((sum: number, adj: InventoryAdjustment) => sum + adj.quantity, 0);

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
    <MainLayout title="Inventory Adjustments" subtitle="Track and manage stock level changes">
      <div className="space-y-6">
        {/* Action Button */}
        <div className="flex flex-row-reverse justify-between items-center">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Adjustment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Inventory Adjustment</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="adjustmentType">Adjustment Type</Label>
                    <Select
                      value={formData.adjustmentType}
                      onValueChange={(value: "increase" | "decrease") =>
                        setFormData({
                          ...formData,
                          adjustmentType: value,
                          adjustmentReasonId: "",
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="decrease">Decrease (Remove Stock)</SelectItem>
                        <SelectItem value="increase">Increase (Add Stock)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inventoryItem">Inventory Item</Label>
                    <Select
                      value={formData.inventoryItemId}
                      onValueChange={(value) =>
                        setFormData({ ...formData, inventoryItemId: value, batchId: "general" })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select an item..." />
                      </SelectTrigger>
                      <SelectContent>
                        {inventoryItems.map((item: InventoryItem) => (
                          <SelectItem key={item.id} value={String(item.id)}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Batch Selection - Show for decrease type */}
                  {formData.adjustmentType === "decrease" && (
                    <div className="space-y-2">
                      <Label htmlFor="batch">Batch (Optional)</Label>
                      <Select
                        value={formData.batchId}
                        onValueChange={(value) =>
                          setFormData({ ...formData, batchId: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a batch..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General Stock</SelectItem>
                          {batches.length === 0 ? (
                            <div className="p-2 text-sm text-muted-foreground">
                              No batches available
                            </div>
                          ) : (
                            batches.map((batch: Batch) => (
                              <SelectItem key={batch.id} value={String(batch.id)}>
                                <div className="flex items-center gap-2">
                                  <Package className="h-3 w-3" />
                                  {batch.batchNumber}
                                  {batch.expiryDate && (
                                    <span className="text-muted-foreground">
                                      (Exp: {new Date(batch.expiryDate).toLocaleDateString()})
                                    </span>
                                  )}
                                  <Badge variant="outline" className="ml-auto">
                                    {batch.quantity}
                                  </Badge>
                                </div>
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="adjustmentReason">Reason</Label>
                    <Select
                      value={formData.adjustmentReasonId}
                      onValueChange={(value) =>
                        setFormData({ ...formData, adjustmentReasonId: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a reason..." />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredReasons.map((reason: AdjustmentReason) => (
                          <SelectItem key={reason.id} value={String(reason.id)}>
                            {reason.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity ({selectedItem?.unit || "units"})</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      placeholder="Enter quantity"
                      required
                    />
                    {selectedItem && (
                      <p className="text-sm text-muted-foreground">
                        Current: {selectedItem.quantity} {selectedItem.unit}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Input
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Add notes..."
                    />
                  </div>
                </div>
                {formData.adjustmentType === "decrease" && selectedBatch && (
                  <p className="text-sm text-muted-foreground mb-4">
                    Batch: {selectedBatch.batchNumber} ({selectedBatch.quantity} {selectedItem?.unit} available)
                  </p>
                )}
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={handleCloseDialog}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Create Adjustment
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

           {/* Search */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search adjustments..."
              className="pl-9 glass-card"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
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
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">ID</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Date</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Item</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Type</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                        Quantity
                      </th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Batch</th>
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
                          <td className="p-4 text-sm font-medium text-foreground">
                            {adjustment.adjustmentNumber}
                          </td>
                          <td className="p-4 text-sm text-muted-foreground">
                            {new Date(adjustment.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-4 text-sm text-foreground">
                            {adjustment.inventoryItem?.name || `Item #${adjustment.inventoryItemId}`}
                          </td>
                          <td className="p-4">
                            <Badge
                              className={
                                typeStyles[adjustment.adjustmentType as keyof typeof typeStyles]
                              }
                            >
                              {adjustment.adjustmentType === "increase" ? (
                                <ArrowUp className="h-3 w-3 mr-1" />
                              ) : (
                                <ArrowDown className="h-3 w-3 mr-1" />
                              )}
                              {adjustment.adjustmentType}
                            </Badge>
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
                            {adjustment.batch?.batchNumber ? (
                              <div className="flex items-center gap-1">
                                <Package className="h-3 w-3" />
                                {adjustment.batch.batchNumber}
                              </div>
                            ) : (
                              "-"
                            )}
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
