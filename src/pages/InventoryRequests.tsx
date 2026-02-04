import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Clock, Flame, Wine, Eye } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { StockRequestService } from "@/services/stockRequestService";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

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

const InventoryRequests = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const navigate = useNavigate();

  // Fetch stock requests
  const { data: stockRequests = [], isLoading } = useQuery({
    queryKey: ['stock-requests', selectedDepartment, selectedStatus],
    queryFn: async () => {
      return StockRequestService.getAllStockRequests({
        department: selectedDepartment || undefined,
        status: selectedStatus || undefined,
      });
    },
  });

  // Filter stock requests based on search
  const filteredRequests = (stockRequests as any[]).filter(request => {
    const matchesSearch = 
      request.requestId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.requestedBy?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.requestItems?.some((item: any) => 
        item.item?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesSearch;
  });

  // Calculate stats
  const pendingCount = (stockRequests as any[]).filter(r => r.status === 'pending').length;
  const kitchenCount = (stockRequests as any[]).filter(r => r.requestedFrom === 'KITCHEN').length;
  const barCount = (stockRequests as any[]).filter(r => r.requestedFrom === 'BAR').length;
  const fulfilledToday = (stockRequests as any[]).filter(r => 
    r.status === 'fulfilled' && 
    new Date(r.fulfilledAt).toDateString() === new Date().toDateString()
  ).length;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const handleViewDetails = (id: number) => {
    navigate(`/inventory/requests/${id}`);
  };

  return (
    <MainLayout title="Inventory Requests" subtitle="Manage stock requests from kitchen and bar">
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="glass-card">
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
          <Card className="glass-card">
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
          <Card className="glass-card">
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
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Fulfilled Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-500">{fulfilledToday}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by request ID, requested by, or item name..." 
              className="pl-9 glass-card" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select value={selectedDepartment || "all"} onValueChange={(val) => setSelectedDepartment(val === "all" ? "" : val)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="KITCHEN">Kitchen</SelectItem>
                <SelectItem value="BAR">Bar</SelectItem>
                <SelectItem value="SERVICE">Service</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus || "all"} onValueChange={(val) => setSelectedStatus(val === "all" ? "" : val)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="fulfilled">Fulfilled</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Requests List */}
        <Card className="glass-card">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="p-8 text-center text-muted-foreground">Loading requests...</div>
              ) : filteredRequests.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No stock requests found.
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Request ID</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Date</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Source</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Items</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Requested By</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map((request) => (
                      <tr key={request.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="p-4 text-sm font-medium text-foreground">{request.requestId}</td>
                        <td className="p-4 text-sm text-muted-foreground">{formatDate(request.requestedAt)}</td>
                        <td className="p-4">
                          <Badge className={sourceStyles[request.requestedFrom || ''] || "bg-gray-500/10 text-gray-500"}>
                            {request.requestedFrom === "KITCHEN" && <Flame className="h-3 w-3 mr-1" />}
                            {request.requestedFrom === "BAR" && <Wine className="h-3 w-3 mr-1" />}
                            {request.requestedFrom || 'N/A'}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="space-y-1">
                            {request.requestItems?.slice(0, 2).map((item: any, idx: number) => (
                              <div key={idx} className="text-sm">
                                {item.quantity}x {item.item?.name || `Item #${item.itemId}`}
                              </div>
                            ))}
                            {request.requestItems?.length > 2 && (
                              <div className="text-xs text-muted-foreground">
                                +{request.requestItems.length - 2} more
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">{request.requestedBy || 'N/A'}</td>
                        <td className="p-4">
                          <Badge className={statusStyles[request.status] || "bg-gray-500/10 text-gray-500"}>
                            {request.status}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(request.id)}
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default InventoryRequests;
