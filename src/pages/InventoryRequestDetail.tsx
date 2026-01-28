import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Check, X, Loader2, AlertCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { InventoryService } from "@/services/inventoryService";

const statusStyles: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  approved: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  fulfilled: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  rejected: "bg-red-500/10 text-red-500 border-red-500/20",
};

const sourceStyles: Record<string, string> = {
  KITCHEN: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  BAR: "bg-purple-500/10 text-purple-500 border-purple-500/20",
};

interface StockRequestItem {
  id: number;
  itemId: number;
  quantity: number;
  status: string;
  item?: {
    id: number;
    name: string;
    quantity: number;
    unit: string;
  };
}

interface StockRequest {
  id: number;
  requestId: string;
  status: 'pending' | 'approved' | 'rejected' | 'fulfilled';
  requestedBy: string | null;
  requestedFrom: string;
  requestedAt: string;
  approvedAt: string | null;
  fulfilledAt: string | null;
  requestItems: StockRequestItem[];
}

const InventoryRequestDetail = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams<{ id: string }>();
  const requestId = parseInt(id || '0');

  // Fetch stock request by ID
  const { data: stockRequest, isLoading } = useQuery({
    queryKey: ['stockRequest', requestId],
    queryFn: async () => {
      const allRequests = await InventoryService.getAllStockRequests();
      return allRequests.find((r: StockRequest) => r.id === requestId) as StockRequest | undefined;
    },
    enabled: !!requestId,
  });

  // Approve stock request mutation
  const approveMutation = useMutation({
    mutationFn: () => InventoryService.updateStockRequestStatus(requestId, 'approved'),
    onSuccess: () => {
      toast({ title: "Success", description: "Stock request approved successfully" });
      queryClient.invalidateQueries({ queryKey: ['stockRequest', requestId] });
      queryClient.invalidateQueries({ queryKey: ['allStockRequests'] });
      navigate('/inventory/requests');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to approve request. Some items may exceed available stock.",
        variant: "destructive",
      });
    },
  });

  // Reject stock request mutation
  const rejectMutation = useMutation({
    mutationFn: () => InventoryService.updateStockRequestStatus(requestId, 'rejected'),
    onSuccess: () => {
      toast({ title: "Success", description: "Stock request rejected" });
      queryClient.invalidateQueries({ queryKey: ['stockRequest', requestId] });
      queryClient.invalidateQueries({ queryKey: ['allStockRequests'] });
      navigate('/inventory/requests');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reject request",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <MainLayout title="Loading...">
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </MainLayout>
    );
  }

  if (!stockRequest) {
    return (
      <MainLayout title="Not Found">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Stock request not found</p>
          <Button variant="outline" onClick={() => navigate('/inventory/requests')} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Requests
          </Button>
        </div>
      </MainLayout>
    );
  }

  const handleApprove = () => {
    if (stockRequest.requestItems.length === 0) {
      toast({
        title: "Error",
        description: "This request has no items",
        variant: "destructive",
      });
      return;
    }
    approveMutation.mutate();
  };

  const handleReject = () => {
    rejectMutation.mutate();
  };

  return (
    <MainLayout title={`Stock Request: ${stockRequest.requestId}`}>
      <div className="space-y-6">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => navigate('/inventory/requests')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Requests
        </Button>

        {/* Request Info Card */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Request Details</span>
              <Badge className={statusStyles[stockRequest.status] || statusStyles.pending}>
                {stockRequest.status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Request ID</p>
                <p className="font-medium">{stockRequest.requestId}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Source</p>
                <Badge className={sourceStyles[stockRequest.requestedFrom] || sourceStyles.KITCHEN}>
                  {stockRequest.requestedFrom}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Requested By</p>
                <p className="font-medium">{stockRequest.requestedBy || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Requested At</p>
                <p className="font-medium">{new Date(stockRequest.requestedAt).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Items Table */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Requested Items</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Available Stock</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stockRequest.requestItems.map((item) => {
                  const availableStock = item.item?.quantity || 0;
                  const requestedQty = item.quantity;
                  const isOverstock = requestedQty > availableStock;
                  const canFulfill = availableStock >= requestedQty;

                  return (
                    <TableRow key={item.id} className={!canFulfill ? "bg-red-50" : ""}>
                      <TableCell className="font-medium">
                        {item.item?.name || `Item ${item.itemId}`}
                      </TableCell>
                      <TableCell>{requestedQty} {item.item?.unit}</TableCell>
                      <TableCell>
                        <span className={isOverstock ? "text-red-500 font-medium" : ""}>
                          {availableStock} {item.item?.unit}
                        </span>
                        {!canFulfill && (
                          <span className="ml-2 text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Cannot fulfill
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {canFulfill ? (
                          <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                            Can fulfill
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            Insufficient stock
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        {stockRequest.status === 'pending' && (
          <div className="flex justify-end gap-4">
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={rejectMutation.isPending}
            >
              {rejectMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Rejecting...
                </>
              ) : (
                <>
                  <X className="h-4 w-4 mr-2" /> Reject Request
                </>
              )}
            </Button>
            <Button
              variant="default"
              className="bg-emerald-500 hover:bg-emerald-600"
              onClick={handleApprove}
              disabled={approveMutation.isPending}
            >
              {approveMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Approving...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" /> Approve Request
                </>
              )}
            </Button>
          </div>
        )}

        {/* Status Info */}
        {stockRequest.status !== 'pending' && (
          <Card className="glass-card">
            <CardContent className="py-4">
              <div className="flex items-center gap-4">
                {stockRequest.status === 'fulfilled' && (
                  <>
                    <Check className="h-5 w-5 text-green-500" />
                    <span>This request was fulfilled on {new Date(stockRequest.fulfilledAt || '').toLocaleString()}</span>
                  </>
                )}
                {stockRequest.status === 'rejected' && (
                  <>
                    <X className="h-5 w-5 text-red-500" />
                    <span>This request was rejected</span>
                  </>
                )}
                {stockRequest.status === 'approved' && (
                  <>
                    <Check className="h-5 w-5 text-blue-500" />
                    <span>Approved at {new Date(stockRequest.approvedAt || '').toLocaleString()}</span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default InventoryRequestDetail;