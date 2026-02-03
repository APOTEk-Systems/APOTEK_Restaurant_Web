import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Check, X, Clock, Flame, Wine, Calendar, User, Package } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StockRequestService } from "@/services/stockRequestService";
import { toast } from "@/components/ui/use-toast";

const statusStyles: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  approved: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  fulfilled: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  rejected: "bg-red-500/10 text-red-500 border-red-500/20",
};

const sourceStyles: Record<string, string> = {
  KITCHEN: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  BAR: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  SERVICE: "bg-blue-500/10 text-blue-500 border-blue-500/20",
};

const InventoryRequestDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch stock request by ID
  const { data: stockRequest, isLoading } = useQuery({
    queryKey: ['stock-request', id],
    queryFn: async () => {
      if (!id) throw new Error("No ID provided");
      const requests = await StockRequestService.getAllStockRequests();
      return requests.find((r: any) => r.id === parseInt(id));
    },
    enabled: !!id,
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ status }: { status: 'approved' | 'rejected' }) => {
      if (!id) throw new Error("No ID provided");
      return StockRequestService.updateStockRequestStatus(parseInt(id), { status });
    },
    onSuccess: () => {
      toast({
        title: "Status Updated",
        description: "Stock request status has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['stock-request'] });
      queryClient.invalidateQueries({ queryKey: ['stock-requests'] });
      navigate('/inventory-requests');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update status.",
        variant: "destructive",
      });
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const handleApprove = () => {
    updateStatusMutation.mutate({ status: 'approved' });
  };

  const handleReject = () => {
    updateStatusMutation.mutate({ status: 'rejected' });
  };

  if (isLoading) {
    return (
      <MainLayout title="Stock Request Details" subtitle="Loading...">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading request details...</div>
        </div>
      </MainLayout>
    );
  }

  if (!stockRequest) {
    return (
      <MainLayout title="Stock Request Details" subtitle="Not Found">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Stock request not found.</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout 
      title={`Stock Request: ${stockRequest.requestId}`} 
      subtitle="View and manage stock request details"
    >
      <div className="space-y-6">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/inventory-requests')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Requests
        </Button>

        {/* Status and Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <Badge className={statusStyles[stockRequest.status] || "bg-gray-500/10 text-gray-500"}>
              {stockRequest.status}
            </Badge>
            <Badge className={sourceStyles[stockRequest.requestedFrom || ''] || "bg-gray-500/10 text-gray-500"}>
              {stockRequest.requestedFrom === "KITCHEN" && <Flame className="h-3 w-3 mr-1" />}
              {stockRequest.requestedFrom === "BAR" && <Wine className="h-3 w-3 mr-1" />}
              {stockRequest.requestedFrom || 'N/A'}
            </Badge>
          </div>
          
          {stockRequest.status === "pending" && (
            <div className="flex gap-2">
              <Button 
                className="bg-emerald-500 hover:bg-emerald-600"
                onClick={handleApprove}
                disabled={updateStatusMutation.isPending}
              >
                <Check className="h-4 w-4 mr-2" />
                {updateStatusMutation.isPending ? 'Approving...' : 'Approve'}
              </Button>
              <Button 
                variant="destructive"
                onClick={handleReject}
                disabled={updateStatusMutation.isPending}
              >
                <X className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </div>
          )}
        </div>

        {/* Details Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Request Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Request ID</span>
                <span className="font-medium">{stockRequest.requestId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Requested At</span>
                <span className="font-medium">{formatDate(stockRequest.requestedAt)}</span>
              </div>
              {stockRequest.approvedAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Approved At</span>
                  <span className="font-medium">{formatDate(stockRequest.approvedAt)}</span>
                </div>
              )}
              {stockRequest.fulfilledAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fulfilled At</span>
                  <span className="font-medium">{formatDate(stockRequest.fulfilledAt)}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <User className="h-4 w-4" />
                Requested By
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Department</span>
                <span className="font-medium">{stockRequest.requestedFrom || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Requested By</span>
                <span className="font-medium">{stockRequest.requestedBy || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Items</span>
                <span className="font-medium">{stockRequest.requestItems?.length || 0} items</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Request Items */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Package className="h-4 w-4" />
              Requested Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stockRequest.requestItems?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Item</th>
                      <th className="text-right p-3 text-sm font-medium text-muted-foreground">Quantity</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stockRequest.requestItems.map((item: any, index: number) => (
                      <tr key={index} className="border-b border-border/50">
                        <td className="p-3">
                          <div className="font-medium">{item.item?.name || `Item #${item.itemId}`}</div>
                          {item.item?.sku && (
                            <div className="text-xs text-muted-foreground">SKU: {item.item.sku}</div>
                          )}
                        </td>
                        <td className="p-3 text-right font-medium">{item.quantity}</td>
                        <td className="p-3">
                          <Badge variant="secondary">{item.status || 'pending'}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-4">
                No items in this request.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notes */}
        {stockRequest.notes && (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground">{stockRequest.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default InventoryRequestDetail;