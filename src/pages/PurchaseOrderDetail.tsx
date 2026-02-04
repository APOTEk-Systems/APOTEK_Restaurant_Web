import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { purchaseOrderService, type PurchaseOrder } from "@/services/purchaseOrderService";
import { cn } from "@/lib/utils";

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

  // Fetch purchase order by ID
  const { data: purchaseOrder, isLoading, isError, error } = useQuery({
    queryKey: ["purchaseOrder", purchaseOrderId],
    queryFn: () => purchaseOrderService.getPurchaseOrderById(purchaseOrderId),
    enabled: !!purchaseOrderId,
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
    <MainLayout title={`Purchase Order: ${purchaseOrder.poNumber}`} subtitle="View and manage purchase order">
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
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
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
                  Ordered: {purchaseOrder.orderedAt ? new Date(purchaseOrder.orderedAt).toLocaleDateString() : "-"}
                </p>
                {purchaseOrder.expectedDeliveryAt && (
                  <p className="text-muted-foreground text-sm">
                    Expected Delivery: {new Date(purchaseOrder.expectedDeliveryAt).toLocaleDateString()}
                  </p>
                )}
              </div>

              {/* Status Info */}
              <div className="text-sm text-muted-foreground">
                {purchaseOrder.status === "PENDING" && "This order is awaiting approval."}
                {purchaseOrder.status === "ORDERED" && "This order has been approved and is awaiting delivery."}
                {purchaseOrder.status === "PARTIALLY_RECEIVED" && "Some items have been received. Status updates automatically as goods arrive."}
                {purchaseOrder.status === "COMPLETED" && "All items have been received."}
                {purchaseOrder.status === "CANCELLED" && "This order has been cancelled."}
              </div>
            </div>
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
                        <div className="text-sm text-muted-foreground">{item.inventoryItem?.unit || "N/A"}</div>
                      </td>
                      <td className="px-4 py-3 text-center">{item.quantityOrdered}</td>
                      <td className="px-4 py-3 text-right">${item.unitPrice.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right font-semibold">
                        ${(item.quantityOrdered * item.unitPrice).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-muted/30">
                  <tr>
                    <td colSpan={3} className="px-4 py-3 text-right font-semibold">Total</td>
                    <td className="px-4 py-3 text-right font-bold text-primary">
                      ${orderTotal.toFixed(2)}
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