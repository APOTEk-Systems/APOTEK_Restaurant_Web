import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2, AlertCircle, Check, X, Package } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { purchaseOrderService, type PurchaseOrder } from "@/services/purchaseOrderService";
import { inventoryUnitService, type InventoryUnit } from "@/services/inventoryUnitService";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useState, useMemo } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const statusStyles: Record<string, string> = {
  PENDING: "bg-warning/10 text-warning border-warning/20",
  APPROVED: "bg-success/10 text-success border-success/20",
  ORDERED: "bg-primary/10 text-primary border-primary/20",
  PARTIALLY_RECEIVED: "bg-primary/10 text-primary border-primary/20",
  COMPLETED: "bg-success/10 text-success border-success/20",
  CANCELLED: "bg-destructive/10 text-destructive border-destructive/20",
};

const statusLabels: Record<string, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  ORDERED: "Ordered",
  PARTIALLY_RECEIVED: "Partially Received",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export default function PurchaseOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const purchaseOrderId = parseInt(id || "0");
  const queryClient = useQueryClient();
  const [rejectReason, setRejectReason] = useState("");

  // Fetch purchase order by ID
  const { data: purchaseOrder, isLoading, isError, error } = useQuery({
    queryKey: ["purchaseOrder", purchaseOrderId],
    queryFn: () => purchaseOrderService.getPurchaseOrderById(purchaseOrderId),
    enabled: !!purchaseOrderId,
  });

  // Fetch inventory units for symbol lookup
  const { data: inventoryUnits = [] } = useQuery({
    queryKey: ["inventory-units"],
    queryFn: () => inventoryUnitService.getAll(),
  });

  // Create a map of unit name (lowercase) to symbol for case-insensitive lookup
  const unitSymbolMap = useMemo(() => {
    const map: Record<string, string> = {};
    (inventoryUnits as InventoryUnit[]).forEach((unit) => {
      const key = unit.name.toLowerCase();
      map[key] = unit.symbol || unit.name;
    });
    return map;
  }, [inventoryUnits]);

  // Helper function to get unit symbol with contains matching
  const getUnitSymbol = (unitName: string): string => {
    if (!unitName) return "";
    
    const normalizedName = unitName.toLowerCase();
    
    // Try exact match first
    if (unitSymbolMap[normalizedName]) {
      return unitSymbolMap[normalizedName];
    }
    
    // Try contains match (e.g., "kilograms" contains "kilogram")
    for (const [key, value] of Object.entries(unitSymbolMap)) {
      if (normalizedName.includes(key) || key.includes(normalizedName)) {
        return value;
      }
    }
    
    return unitName;
  };

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: () => purchaseOrderService.approvePurchaseOrder(purchaseOrderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchaseOrders"] });
      queryClient.invalidateQueries({ queryKey: ["purchaseOrder", purchaseOrderId] });
      toast.success("Purchase order approved successfully");
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || "Failed to approve purchase order";
      toast.error(errorMessage);
    },
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: (reason?: string) => purchaseOrderService.rejectPurchaseOrder(purchaseOrderId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchaseOrders"] });
      queryClient.invalidateQueries({ queryKey: ["purchaseOrder", purchaseOrderId] });
      toast.success("Purchase order rejected");
      setRejectReason("");
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || "Failed to reject purchase order";
      toast.error(errorMessage);
    },
  });

  if (isLoading) {
    return (
      <MainLayout title="Purchase Order Details" subtitle="Loading...">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Loading purchase order details...</span>
        </div>
      </MainLayout>
    );
  }

  if (isError || !purchaseOrder) {
    return (
      <MainLayout title="Purchase Order Details" subtitle="Error">
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

  const orderTotal = purchaseOrder.items.reduce((sum: number, item: any) => 
    sum + (item.quantityOrdered * item.unitPrice), 0
  );

  return (
    <MainLayout title={`Purchase Order`} subtitle="View and manage purchase order">
      <div className="space-y-6 animate-fade-in">
        {/* Back Button */}
        <Link to="/purchases">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Purchase Orders
          </Button>
        </Link>

        {/* Order Header */}
        <Card className="shadow-card border-border/50">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold">{purchaseOrder.poNumber}</h2>
                  <Badge className={cn("capitalize", statusStyles[purchaseOrder.status])}>
                    {statusLabels[purchaseOrder.status] || purchaseOrder.status}
                  </Badge>
                </div>
                <p className="text-muted-foreground mt-1">
                  Supplier: {purchaseOrder.supplier?.name || `Supplier #${purchaseOrder.supplierId}`}
                </p>
                <p className="text-muted-foreground text-sm">
                  Date: {purchaseOrder.orderedAt ? new Date(purchaseOrder.orderedAt).toLocaleDateString() : "-"}
                </p>
                {purchaseOrder.expectedDeliveryAt && (
                  <p className="text-muted-foreground text-sm">
                    Expected Delivery: {new Date(purchaseOrder.expectedDeliveryAt).toLocaleDateString()}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2">
                {/* Pending Actions */}
                {purchaseOrder.status === "PENDING"  && (
                  <div className="flex gap-2">
                    {/* Approve Dialog */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button className="gap-2">
                          <Check className="h-4 w-4" />
                          Approve
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Approve Purchase Order</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to approve this purchase order? This action will change the status to "Approved".
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => approveMutation.mutate()}
                            disabled={approveMutation.isPending}
                          >
                            {approveMutation.isPending ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Approving...
                              </>
                            ) : (
                              "Approve"
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    {/* Reject Dialog */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" className="gap-2">
                          <X className="h-4 w-4" />
                          Reject
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Reject Purchase Order</AlertDialogTitle>
                          <AlertDialogDescription>
                            Please provide a reason for rejecting this purchase order.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="py-4">
                          <Input
                            placeholder="Rejection reason..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                          />
                        </div>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => rejectMutation.mutate(rejectReason)}
                            disabled={rejectMutation.isPending}
                          >
                            {rejectMutation.isPending ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Rejecting...
                              </>
                            ) : (
                              "Reject"
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}

                {/* Receive Goods Button for Approved/Ordered POs */}
                {(purchaseOrder.status === "APPROVED" || purchaseOrder.status ==="PARTIALLY_RECEIVED" || purchaseOrder.status === "ORDERED") && (
                  <Button asChild className="gap-2">
                    <Link to={`/purchases/receiving/new/${purchaseOrder.id}`}>
                      <Package className="h-4 w-4" />
                      Receive Goods
                    </Link>
                  </Button>
                )}
              </div>
            </div>

            {/* Status Info */}
            {/* <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                {purchaseOrder.status === "PENDING" && "This order is awaiting approval."}
                {purchaseOrder.status === "ORDERED" && "This order has been approved and is awaiting delivery."}
                {purchaseOrder.status === "PARTIALLY_RECEIVED" && "Some items have been received. Status updates automatically as goods arrive."}
                {purchaseOrder.status === "COMPLETED" && "All items have been received."}
                {purchaseOrder.status === "CANCELLED" && "This order has been cancelled."}
              </p>
            </div> */}
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card className="shadow-card border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Order Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Item</th>
                    <th className="text-center px-4 py-3 text-sm font-medium text-muted-foreground">Quantity</th>
                    <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">Unit Price</th>
                    <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {purchaseOrder.items.map((item: any) => (
                    <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium">{item.inventoryItem?.name || `Item #${item.inventoryItemId}`}</div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {item.quantityOrdered} {getUnitSymbol(item.inventoryItem?.unit || "")}
                      </td>
                      <td className="px-4 py-3 text-right">{item.unitPrice.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-semibold">
                        {(item.quantityOrdered * item.unitPrice).toLocaleString('en-US')}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-muted/30">
                  <tr>
                    <td colSpan={3} className="px-4 py-3 text-right font-semibold">Total</td>
                    <td className="px-4 py-3 text-right font-bold text-primary">
                      {orderTotal.toLocaleString('en-US')}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        {purchaseOrder.notes && (
          <Card className="shadow-card border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{purchaseOrder.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}