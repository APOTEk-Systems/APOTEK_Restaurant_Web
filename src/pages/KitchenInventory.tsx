import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, ArrowUpDown, Package, CheckCircle2, Plus, X, AlertCircle, FileText, Calendar } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DepartmentInventoryService, DepartmentInventoryItem } from "@/services/departmentInventoryService";
import { StockRequestService, StockRequest } from "@/services/stockRequestService";
import { toast } from "@/components/ui/use-toast";
import { format, subDays } from "date-fns";

export default function KitchenInventory() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("items");
  const [selectedItem, setSelectedItem] = useState<DepartmentInventoryItem | null>(null);
  const [updateAmount, setUpdateAmount] = useState("");
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
  });
  const queryClient = useQueryClient();

  // Fetch kitchen inventory
  const { data: inventoryItems = [], isLoading: isLoadingInventory, error: inventoryError } = useQuery({
    queryKey: ['department-inventory', 'KITCHEN'],
    queryFn: async () => {
      const items = await DepartmentInventoryService.getDepartmentInventory('KITCHEN');
      return items;
    },
  });

  // Fetch kitchen stock requests
  const { data: stockRequests = [], isLoading: isLoadingRequests } = useQuery({
    queryKey: ['stock-requests', 'KITCHEN', dateRange.startDate, dateRange.endDate],
    queryFn: async () => {
      const requests = await StockRequestService.getAllStockRequests({
        department: 'KITCHEN',
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
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
      queryClient.invalidateQueries({ queryKey: ['department-inventory', 'KITCHEN'] });
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
      <MainLayout title="Kitchen Inventory">
        <div className="space-y-6">
          <div className="text-center py-8">Loading inventory...</div>
        </div>
      </MainLayout>
    );
  }

  if (inventoryError) {
    return (
      <MainLayout title="Kitchen Inventory">
        <div className="space-y-6">
          <div className="text-center py-8 text-destructive">
            Error loading inventory: {(inventoryError as Error)?.message || 'Unknown error'}
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Kitchen Inventory">
      <div className="space-y-4">
        {/* Stats */}
        

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
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <Input
                      type="date"
                      value={dateRange.startDate}
                      onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-40"
                    />
                    <span className="text-muted-foreground">to</span>
                    <Input
                      type="date"
                      value={dateRange.endDate}
                      onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                      className="w-40"
                    />
                  </div>
                </div>
                <Button onClick={() => navigate('/inventory-requests/new')} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
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
                  Update the quantity of {selectedItem?.name} in kitchen inventory
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
