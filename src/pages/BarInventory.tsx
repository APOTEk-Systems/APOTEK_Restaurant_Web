import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Wine, AlertCircle, Calendar } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { DateRangePicker, type DateRange } from "@/components/ui/date-range-picker";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DepartmentInventoryService, DepartmentInventoryItem } from "@/services/departmentInventoryService";
import { StockRequestService, StockRequest } from "@/services/stockRequestService";
import { toast } from "@/components/ui/use-toast";
import { format, subDays } from "date-fns";

export default function BarInventory() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("items");
  const [selectedItem, setSelectedItem] = useState<DepartmentInventoryItem | null>(null);
  const [updateAmount, setUpdateAmount] = useState("");
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<StockRequest | null>(null);
  // Initialize with today's date range (start of day to end of day, timezone-independent)
  const today = new Date();
  const startOfDay = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 0, 0, 0, 0));
  const endOfDay = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 23, 59, 59, 999));
  
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfDay,
    to: endOfDay,
  });
  const queryClient = useQueryClient();

  // Fetch bar inventory
  const { data: inventoryItems = [], isLoading: isLoadingInventory, error: inventoryError } = useQuery({
    queryKey: ['department-inventory', 'BAR'],
    queryFn: async () => {
      const items = await DepartmentInventoryService.getDepartmentInventory('BAR');
      return items;
    },
  });

  // Fetch bar stock requests
  const { data: stockRequests = [], isLoading: isLoadingRequests } = useQuery({
    queryKey: ['stock-requests', 'BAR', dateRange?.from, dateRange?.to],
    queryFn: async () => {
      const requests = await StockRequestService.getAllStockRequests({
        department: 'BAR',
        startDate: dateRange?.from ? dateRange.from.toISOString() : undefined,
        endDate: dateRange?.to ? dateRange.to.toISOString() : undefined,
      });
      return requests;
    },
  });

  const filteredItems = (inventoryItems as DepartmentInventoryItem[]).filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.categoryName && item.categoryName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Update inventory mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: number; quantity: number }) => {
      return DepartmentInventoryService.updateDepartmentInventory(id, { quantity });
    },
    onSuccess: () => {
      toast({
        title: "Inventory Updated",
        description: "The inventory quantity has been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ['department-inventory', 'BAR'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update inventory.",
        variant: "destructive",
      });
    },
  });

  const handleUpdateClick = (item: DepartmentInventoryItem) => {
    setSelectedItem(item);
    setUpdateAmount(item.currentStock.toString());
    setIsUpdateModalOpen(true);
  };

  const handleUpdateSubmit = () => {
    if (!selectedItem || !selectedItem.departmentInventoryId) return;
    
    const newQuantity = parseFloat(updateAmount);
    if (isNaN(newQuantity) || newQuantity < 0) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid quantity.",
        variant: "destructive",
      });
      return;
    }

    updateMutation.mutate({
      id: selectedItem.departmentInventoryId,
      quantity: newQuantity,
    });
    setIsUpdateModalOpen(false);
  };

  // Calculate stats
  const totalItems = inventoryItems.length;
  const lowStockItems = (inventoryItems as DepartmentInventoryItem[]).filter(item => item.currentStock <= 5 && item.currentStock > 0).length;
  const outOfStockItems = (inventoryItems as DepartmentInventoryItem[]).filter(item => item.currentStock === 0).length;

  if (isLoadingInventory) {
    return (
      <MainLayout title="Bar Inventory">
        <div className="space-y-6">
          <div className="text-center py-8">Loading inventory...</div>
        </div>
      </MainLayout>
    );
  }

  if (inventoryError) {
    return (
      <MainLayout title="Bar Inventory">
        <div className="space-y-6">
          <div className="text-center py-8 text-destructive">
            Error loading inventory: {(inventoryError as Error)?.message || 'Unknown error'}
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Bar Inventory">
      <div className="space-y-4">
       

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-muted/50 w-full">
            <TabsTrigger value="items" className="flex-1">Items</TabsTrigger>
            <TabsTrigger value="requests" className="flex-1">Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="items" className="mt-6">
            <div className="space-y-6">
              {/* Search */}
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search inventory..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Inventory Table */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Inventory Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredItems.map((item) => {
                        const isDisabled = item.currentStock === 0 || item.departmentInventoryId === null;
                        const getStatusBadge = () => {
                          if (item.currentStock === 0) {
                            return <Badge variant="destructive" className="text-xs">Out of Stock</Badge>;
                          }
                          if (item.currentStock <= 5) {
                            return <Badge variant="outline" className="text-xs text-amber-500 border-amber-500">Low Stock</Badge>;
                          }
                          return <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-500 border-green-500/20">In Stock</Badge>;
                        };
                        return (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell>{item.categoryName || 'N/A'}</TableCell>
                            <TableCell>
                              <span className={item.currentStock === 0 ? "text-red-500 font-medium" : ""}>
                                {item.currentStock} {item.unit}
                              </span>
                            </TableCell>
                            <TableCell>{getStatusBadge()}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleUpdateClick(item)}
                                disabled={isDisabled || updateMutation.isPending}
                              >
                                Update
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="requests" className="mt-6">
            <div className="space-y-6">
              {/* Date Filter and New Request Button */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                  <DateRangePicker
                    dateRange={dateRange}
                    onDateRangeChange={setDateRange}
                  />
                  {dateRange && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDateRange({
                        from: startOfDay,
                        to: endOfDay,
                      })}
                    >
                      Today
                    </Button>
                  )}
                </div>
                <Button onClick={() => navigate('/inventory-requests/new')} className="flex items-center gap-2">
                  New Request
                </Button>
              </div>

              {/* Stock Requests List */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Stock Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingRequests ? (
                    <div className="text-center py-8">Loading requests...</div>
                  ) : stockRequests.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No stock requests found for the selected date range.
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Request ID</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Items</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Requested By</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {stockRequests.map((request: StockRequest) => (
                          <TableRow key={request.id}>
                            <TableCell className="font-mono text-sm">{request.requestId}</TableCell>
                            <TableCell>{format(new Date(request.requestedAt), 'MMM d, yyyy')}</TableCell>
                            <TableCell>{request.requestItems.length} items</TableCell>
                            <TableCell>
                              <Badge variant={
                                request.status === 'fulfilled' ? 'default' :
                                request.status === 'approved' ? 'default' :
                                request.status === 'rejected' ? 'destructive' : 'secondary'
                              }>
                                {request.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{request.requestedBy || '-'}</TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setIsViewModalOpen(true);
                                }}
                              >
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* View Request Modal */}
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Stock Request Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                <Label className="text-sm text-muted-foreground">Request #</Label>
                  <p className="font-medium">{selectedRequest?.requestId}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Requested By</Label>
                  <p className="font-medium">{selectedRequest?.requestedBy || '-'}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Date</Label>
                  <p className="font-medium">{selectedRequest ? format(new Date(selectedRequest.requestedAt), 'dd/MM/yyyy HH:mm') : '-'}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Status</Label>
                  <p className="font-medium capitalize">{selectedRequest?.status}</p>
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-3">Requested Items</h4>
                {selectedRequest?.requestItems && selectedRequest.requestItems.length > 0 ? (
                  <div className="space-y-2">
                    {selectedRequest.requestItems.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center py-2 border-b last:border-0">
                        <span className="text-sm">{item.item?.name || `Item #${item.itemId}`}</span>
                        <span className="font-medium">{item.quantity} {item.item?.unit || ''}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No items in this request</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Update Inventory Modal */}
        <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Inventory Quantity</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Item Name</Label>
                  <p className="font-medium">{selectedItem?.name}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Unit</Label>
                  <p className="font-medium">{selectedItem?.unit}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="update-amount">Quantity</Label>
                <Input
                  id="update-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder={`Enter quantity in ${selectedItem?.unit}`}
                  value={updateAmount}
                  onChange={(e) => setUpdateAmount(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Update the quantity of {selectedItem?.name} in bar inventory
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsUpdateModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleUpdateSubmit}
                disabled={updateMutation.isPending || !selectedItem?.departmentInventoryId}
              >
                {updateMutation.isPending ? "Updating..." : "Update Quantity"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
