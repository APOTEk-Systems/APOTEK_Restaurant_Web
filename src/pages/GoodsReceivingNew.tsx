import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Package, Loader2, AlertCircle, Save, CheckCircle2 } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { purchaseOrderService, type PurchaseOrder } from "@/services/purchaseOrderService";
import { goodsReceivingService, type GoodsReceiving, type CreateGoodsReceivingData } from "@/services/goodsReceivingService";
import { toast } from "sonner";

interface ReceivedItem {
  inventoryItemId: number;
  inventoryItemName: string;
  unit: string;
  quantityOrdered: number;
  quantityAlreadyReceived: number;
  quantityReceiving: number;
  expiryDate: string;
}

export default function GoodsReceivingNew() {
  const { id } = useParams<{ id: string }>();
  const purchaseOrderId = parseInt(id || "0");
  const queryClient = useQueryClient();
  
  const [receivedItems, setReceivedItems] = useState<ReceivedItem[]>([]);
  const [notes, setNotes] = useState("");

  // Fetch purchase order by ID
  const { data: purchaseOrder, isLoading, isError, error } = useQuery({
    queryKey: ["purchaseOrder", purchaseOrderId],
    queryFn: () => purchaseOrderService.getPurchaseOrderById(purchaseOrderId),
    enabled: !!purchaseOrderId,
  });

  // Fetch existing goods receiving records for this PO
  const { data: existingReceivings = [] } = useQuery({
    queryKey: ["goodsReceivingByPO", purchaseOrderId],
    queryFn: async () => {
      const response = await goodsReceivingService.getGoodsReceivingByPurchaseOrderId(purchaseOrderId);
      return response;
    },
    enabled: !!purchaseOrderId,
  });

  // Calculate already received quantities per item
  const calculateAlreadyReceived = () => {
    const receivedMap: Record<number, number> = {};
    existingReceivings.forEach((gr: GoodsReceiving) => {
      gr.receivedItems?.forEach((item: any) => {
        receivedMap[item.inventoryItemId] = (receivedMap[item.inventoryItemId] || 0) + (item.quantityReceived || 0);
      });
    });
    return receivedMap;
  };

  // Initialize form when PO or existing receivings change
  useEffect(() => {
    if (purchaseOrder?.items) {
      const alreadyReceivedMap = calculateAlreadyReceived();
      setReceivedItems(
        purchaseOrder.items.map((item: any) => ({
          inventoryItemId: item.inventoryItemId,
          inventoryItemName: item.inventoryItem?.name || `Item #${item.inventoryItemId}`,
          unit: item.inventoryItem?.unit || "N/A",
          quantityOrdered: item.quantityOrdered,
          quantityAlreadyReceived: alreadyReceivedMap[item.inventoryItemId] || 0,
          quantityReceiving: 0,
          expiryDate: "",
        }))
      );
    }
  }, [purchaseOrder, existingReceivings]);

  // Create goods receiving mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateGoodsReceivingData) => goodsReceivingService.createGoodsReceiving(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goodsReceiving"] });
      queryClient.invalidateQueries({ queryKey: ["goodsReceivingByPO"] });
      queryClient.invalidateQueries({ queryKey: ["purchaseOrders"] });
      queryClient.invalidateQueries({ queryKey: ["purchaseOrder", purchaseOrderId] });
      toast.success("Goods received successfully");
      // Navigate back to purchases
      setTimeout(() => {
        window.location.href = "/purchases";
      }, 1000);
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || "Failed to record goods receiving";
      toast.error(errorMessage);
    },
  });

  const handleQuantityChange = (index: number, value: number) => {
    const newItems = [...receivedItems];
    const maxReceivable = newItems[index].quantityOrdered - newItems[index].quantityAlreadyReceived;
    newItems[index].quantityReceiving = Math.max(0, Math.min(value, maxReceivable));
    setReceivedItems(newItems);
  };

  const handleExpiryChange = (index: number, value: string) => {
    const newItems = [...receivedItems];
    newItems[index].expiryDate = value;
    setReceivedItems(newItems);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate at least one item has quantity receiving
    const itemsWithQuantity = receivedItems.filter(item => item.quantityReceiving > 0);
    if (itemsWithQuantity.length === 0) {
      toast.error("Please enter quantity received for at least one item");
      return;
    }

    const data: CreateGoodsReceivingData = {
      purchaseOrderId,
      supplierId: purchaseOrder?.supplierId || 1,
      notes: notes || undefined,
      receivedAt: new Date().toISOString(),
      receivedItems: receivedItems
        .filter(item => item.quantityReceiving > 0)
        .map(item => ({
          inventoryItemId: item.inventoryItemId,
          quantityReceived: item.quantityReceiving,
          expiryDate: item.expiryDate || undefined,
        })),
    };

    createMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <MainLayout title="Record Goods Receiving" subtitle="Loading...">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Loading purchase order...</span>
        </div>
      </MainLayout>
    );
  }

  if (isError || !purchaseOrder) {
    return (
      <MainLayout title="Record Goods Receiving" subtitle="Error">
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <p className="text-destructive">Failed to load purchase order: {error instanceof Error ? error.message : "Unknown error"}</p>
        </div>
        <Link to="/purchases">
          <Button variant="ghost" className="mt-4 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Purchase Orders
          </Button>
        </Link>
      </MainLayout>
    );
  }

  const totalOrdered = purchaseOrder.items.reduce((sum: number, item: any) => sum + item.quantityOrdered, 0);
  const totalReceived = receivedItems.reduce((sum, item) => sum + item.quantityReceiving, 0);
  const totalAlreadyReceived = receivedItems.reduce((sum, item) => sum + item.quantityAlreadyReceived, 0);

  return (
    <MainLayout title={`Record Receiving: ${purchaseOrder.poNumber}`} subtitle="Receive goods from purchase order">
      <div className="space-y-6 animate-fade-in">
        {/* Back Button */}
        <Link to={`/purchases/${purchaseOrderId}`}>
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Purchase Order
          </Button>
        </Link>

        {/* Order Summary */}
        <Card className="shadow-card border-border/50">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">{purchaseOrder.poNumber}</h2>
                <p className="text-muted-foreground">
                  Supplier: {purchaseOrder.supplier?.name || `Supplier #${purchaseOrder.supplierId}`}
                </p>
                <p className="text-muted-foreground text-sm">
                  Ordered: {purchaseOrder.orderedAt ? new Date(purchaseOrder.orderedAt).toLocaleDateString() : "-"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Ordered</p>
                <p className="text-2xl font-bold">{totalOrdered} items</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit}>
          {/* GRN Number & Notes */}
          <Card className="shadow-card border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Receiving Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Already Received</Label>
                  <Input
                    value={totalAlreadyReceived}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Receiving Now</Label>
                  <Input
                    value={totalReceived || ''}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional notes..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          <Card className="shadow-card border-border/50 mt-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Items to Receive
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Item</th>
                      <th className="text-center px-4 py-3 text-sm font-medium text-muted-foreground">Ordered</th>
                      <th className="text-center px-4 py-3 text-sm font-medium text-muted-foreground">Received</th>
                      <th className="text-center px-4 py-3 text-sm font-medium text-muted-foreground">Receiving</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Expiry Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {receivedItems.map((item, index) => {
                      const isFullyReceived = item.quantityOrdered === item.quantityAlreadyReceived;
                      const remainingQty = item.quantityOrdered - item.quantityAlreadyReceived;
                      
                      return (
                        <tr key={index} className={`hover:bg-muted/30 transition-colors ${isFullyReceived ? 'bg-muted/20' : ''}`}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {isFullyReceived && (
                                <CheckCircle2 className="h-4 w-4 text-success" />
                              )}
                              <div>
                                <div className="font-medium">{item.inventoryItemName}</div>
                                <div className="text-sm text-muted-foreground">{item.unit}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">{item.quantityOrdered}</td>
                          <td className="px-4 py-3 text-center text-muted-foreground">
                            {item.quantityAlreadyReceived}
                          </td>
                          <td className="px-4 py-3">
                            <Input
                              type="number"
                              min="0"
                              max={remainingQty}
                              value={item.quantityReceiving || ''}
                              onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 0)}
                              placeholder="0"
                              disabled={isFullyReceived || createMutation.isPending}
                              className={`w-24 mx-auto ${isFullyReceived ? 'bg-muted/30' : ''}`}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <Input
                              type="date"
                              value={item.expiryDate}
                              onChange={(e) => handleExpiryChange(index, e.target.value)}
                              disabled={isFullyReceived || createMutation.isPending}
                              className={isFullyReceived ? 'bg-muted/30' : ''}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3 justify-end mt-6">
            <Link to={`/purchases/${purchaseOrderId}`}>
              <Button variant="outline" type="button" disabled={createMutation.isPending}>Cancel</Button>
            </Link>
            <Button
              type="submit"
              disabled={createMutation.isPending || totalReceived === 0}
              className="gap-2"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Recording...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Record Receiving
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}