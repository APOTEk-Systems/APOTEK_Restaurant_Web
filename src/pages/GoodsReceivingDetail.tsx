import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Package, Loader2, AlertCircle, Printer, Edit } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { goodsReceivingService, type GoodsReceiving } from "@/services/goodsReceivingService";
import { purchaseOrderService } from "@/services/purchaseOrderService";
import { cn } from "@/lib/utils";

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

export default function GoodsReceivingDetail() {
  const { id } = useParams<{ id: string }>();
  const receivingId = parseInt(id || "0");

  // Fetch goods receiving record
  const { data: receiving, isLoading, isError, error } = useQuery({
    queryKey: ["goodsReceiving", receivingId],
    queryFn: () => goodsReceivingService.getGoodsReceivingById(receivingId),
    enabled: !!receivingId,
  });

  // Fetch purchase order if linked
  const { data: purchaseOrder } = useQuery({
    queryKey: ["purchaseOrder", receiving?.purchaseOrderId],
    queryFn: () => purchaseOrderService.getPurchaseOrderById(receiving?.purchaseOrderId || 0),
    enabled: !!receiving?.purchaseOrderId,
  });

  // Calculate status
  const determineStatus = (receiving: GoodsReceiving): string => {
    if (!receiving.receivedItems || receiving.receivedItems.length === 0) {
      return "pending";
    }
    return "complete";
  };

  if (isLoading) {
    return (
      <MainLayout title="Goods Receiving Detail" subtitle="Loading...">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Loading goods receiving details...</span>
        </div>
      </MainLayout>
    );
  }

  if (isError || !receiving) {
    return (
      <MainLayout title="Goods Receiving Detail" subtitle="Error">
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <p className="text-destructive">Failed to load goods receiving details: {error instanceof Error ? error.message : "Unknown error"}</p>
        </div>
        <Link to="/purchases/receiving">
          <Button variant="ghost" className="mt-4 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Goods Receiving
          </Button>
        </Link>
      </MainLayout>
    );
  }

  const status = determineStatus(receiving);

  return (
    <MainLayout title={`Goods Received: ${receiving.grnNumber}`} subtitle="View goods received details">
      <div className="space-y-6 animate-fade-in">
        {/* Back Button */}
        <Link to="/purchases/receiving">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Goods Received
          </Button>
        </Link>

        {/* Header Actions */}
        {/* <div className="flex gap-3 justify-end">
          <Button variant="outline" className="gap-2">
            <Printer className="h-4 w-4" />
            Print
          </Button>
          {receiving.purchaseOrderId && (
            <Link to={`/purchases/receiving/new/${receiving.purchaseOrderId}`}>
              <Button variant="outline" className="gap-2">
                <Edit className="h-4 w-4" />
                Record Another Receiving
              </Button>
            </Link>
          )}
        </div> */}

        {/* Receiving Summary */}
        <Card className="shadow-card border-border/50">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold">{receiving.grnNumber}</h2>
                  <Badge className={cn("capitalize", statusStyles[status])}>
                    {statusLabels[status]}
                  </Badge>
                </div>
                <p className="text-muted-foreground mt-1">
                  Supplier: {receiving.supplier?.name || `Supplier #${receiving.supplierId}`}
                </p>
                <p className="text-muted-foreground text-sm">
                  Received: {receiving.receivedAt ? new Date(receiving.receivedAt).toLocaleString() : "-"}
                </p>
                {purchaseOrder && (
                  <p className="text-muted-foreground text-sm">
                    PO Reference: {purchaseOrder.poNumber}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Items Received</p>
                <p className="text-2xl font-bold">{receiving.receivedItems?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        {receiving.notes && (
          <Card className="shadow-card border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{receiving.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Items Table */}
        <Card className="shadow-card border-border/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Received Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Item</th>
                    <th className="text-center px-4 py-3 text-sm font-medium text-muted-foreground">Quantity Received</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Batch/Expiry</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {receiving.receivedItems?.map((item, index) => (
                    <tr key={index} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium">{item.inventoryItem?.name || `Item #${item.inventoryItemId}`}</div>
                        <div className="text-sm text-muted-foreground">{item.inventoryItem?.unit}</div>
                      </td>
                      <td className="px-4 py-3 text-center font-medium">{item.quantityReceived}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {item.batch?.batchNumber && (
                          <div>Batch: {item.batch.batchNumber}</div>
                        )}
                        {item.batch?.expiryDate && (
                          <div>Expires: {new Date(item.batch.expiryDate).toLocaleDateString()}</div>
                        )}
                        {!item.batch?.batchNumber && !item.batch?.expiryDate && (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}