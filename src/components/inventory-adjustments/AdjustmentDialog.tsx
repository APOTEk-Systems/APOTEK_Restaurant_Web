import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Loader2, Package, Calendar } from "lucide-react";
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

interface AdjustmentDialogProps {
  isDialogOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdjustmentDialog({ isDialogOpen, onOpenChange }: AdjustmentDialogProps) {
  const [formData, setFormData] = useState({
    inventoryItemId: "",
    batchId: "general",
    adjustmentReasonId: "",
    adjustmentType: "decrease" as "increase" | "decrease",
    quantity: "",
    notes: "",
  });

  const queryClient = useQueryClient();

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
    onOpenChange(false);
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

  return (
    <Dialog open={isDialogOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button onClick={() => onOpenChange(true)}>
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
            {/* Batch Selection - Show for decrease type */}
            {formData.adjustmentType === "decrease" && (
              <div className="space-y-2">
                <Label htmlFor="batch">Batch</Label>
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
              <Label htmlFor="quantity">Quantity</Label>
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
              <Label htmlFor="notes">Notes</Label>
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
  );
}
