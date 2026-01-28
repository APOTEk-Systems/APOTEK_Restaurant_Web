import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Check, Clock, Flame, Wine, Loader2, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
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

interface StockRequestItem {
  id: number;
  itemId: number;
  quantity: number;
  item?: {
    name: string;
  };
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'fulfilled', label: 'Fulfilled' },
];

const InventoryRequests = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");

  // Fetch stock requests filtered by status from API
  const { data: stockRequests = [], isLoading } = useQuery({
    queryKey: ['stockRequests', statusFilter],
    queryFn: () => InventoryService.getAllStockRequests(statusFilter === 'all' ? undefined : statusFilter),
  });

  // Client-side search filter
  const filteredRequests = stockRequests.filter((item: StockRequest) =>
    item.requestId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.requestedBy?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate summary stats (fetch all for stats)
  const { data: allRequests = [] } = useQuery({
    queryKey: ['allStockRequests'],
    queryFn: () => InventoryService.getAllStockRequests(),
  });

  const pendingCount = allRequests.filter((r: StockRequest) => r.status === 'pending').length;
  const kitchenCount = allRequests.filter((r: StockRequest) => r.requestedFrom === 'KITCHEN').length;
  const barCount = allRequests.filter((r: StockRequest) => r.requestedFrom === 'BAR').length;
  const fulfilledToday = allRequests.filter((r: StockRequest) => 
    r.status === 'fulfilled' && new Date(r.fulfilledAt || '').toDateString() === new Date().toDateString()
  ).length;

  return (
    <MainLayout title="Inventory Requests" subtitle="Manage stock requests from kitchen and bar">
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="glass-card cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setStatusFilter('pending')}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-500">{pendingCount}</div>
            </CardContent>
          </Card>
          <Card className="glass-card cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setStatusFilter('fulfilled')}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Check className="h-4 w-4" />
                Fulfilled Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-500">{fulfilledToday}</div>
            </CardContent>
          </Card>
          <Card className="glass-card cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setStatusFilter('KITCHEN')}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Flame className="h-4 w-4" />
                Kitchen Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">{kitchenCount}</div>
            </CardContent>
          </Card>
          <Card className="glass-card cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setStatusFilter('BAR')}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Wine className="h-4 w-4" />
                Bar Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-500">{barCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search requests..." 
              className="pl-9 glass-card" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Requests List */}
        <Card className="glass-card">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No stock requests found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">ID</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Date</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Source</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Items Count</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Requested By</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map((request: StockRequest) => (
                      <tr key={request.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="p-4 text-sm font-medium text-foreground">{request.requestId}</td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {new Date(request.requestedAt).toLocaleString()}
                        </td>
                        <td className="p-4">
                          <Badge className={sourceStyles[request.requestedFrom] || sourceStyles.KITCHEN}>
                            {request.requestedFrom === 'KITCHEN' ? (
                              <Flame className="h-3 w-3 mr-1" />
                            ) : (
                              <Wine className="h-3 w-3 mr-1" />
                            )}
                            {request.requestedFrom}
                          </Badge>
                        </td>
                        <td className="p-4 text-sm text-foreground">
                          {request.requestItems.length} item(s)
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">{request.requestedBy || '-'}</td>
                        <td className="p-4">
                          <Badge className={statusStyles[request.status] || statusStyles.pending}>
                            {request.status}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8"
                            onClick={() => navigate(`/inventory/requests/${request.id}`)}
                          >
                            View <ArrowRight className="h-4 w-4 ml-1" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default InventoryRequests;
