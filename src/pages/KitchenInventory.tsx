import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, ArrowUpDown, Loader2 } from "lucide-react";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { InventoryService } from "@/services/inventoryService";

interface DepartmentInventory {
  id: number;
  name: string;
  categoryName: string;
  currentStock: number;
  departmentInventoryId: number | null;
  unit: string;
  department: string;
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

interface StockRequestItem {
  id: number;
  itemId: number;
  quantity: number;
  item?: {
    name: string;
  };
}

export default function KitchenInventory() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("items");
  const [selectedItem, setSelectedItem] = useState<DepartmentInventory | null>(null);
  const [updateAmount, setUpdateAmount] = useState("");
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  // Fetch department inventory using React Query
  const { data: inventoryItems = [], isLoading: loadingInventory } = useQuery({
    queryKey: ['departmentInventory', 'KITCHEN'],
    queryFn: () => InventoryService.getDepartmentInventory('KITCHEN'),
  });

  // Fetch stock requests using React Query
  const { data: stockRequests = [], isLoading: loadingRequests } = useQuery({
    queryKey: ['stockRequests', 'KITCHEN'],
    queryFn: () => InventoryService.getStockRequests('KITCHEN'),
  });

  // Update inventory mutation
  const updateInventoryMutation = useMutation({
    mutationFn: ({ id, quantity }: { id: number; quantity: number }) =>
      InventoryService.updateDepartmentInventory(id, { quantity }),
    onSuccess: () => {
      toast({ title: "Success", description: "Inventory updated successfully" });
      queryClient.invalidateQueries({ queryKey: ['departmentInventory', 'KITCHEN'] });
      setIsUpdateModalOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update inventory",
        variant: "destructive",
      });
    },
  });

  const filteredItems = inventoryItems.filter((item: DepartmentInventory) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.categoryName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRequests = stockRequests.filter((item: StockRequest) =>
    item.requestId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.requestItems.some(ri => ri.item?.name?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleUpdateClick = (item: DepartmentInventory) => {
    setSelectedItem(item);
    setUpdateAmount("");
    setIsUpdateModalOpen(true);
  };

  const handleUpdateSubmit = () => {
    if (!updateAmount || isNaN(parseFloat(updateAmount)) || parseFloat(updateAmount) <= 0) {
      toast({ title: "Error", description: "Please enter a valid amount", variant: "destructive" });
      return;
    }

    if (!selectedItem?.departmentInventoryId) {
      toast({ title: "Error", description: "No department inventory record found", variant: "destructive" });
      return;
    }

    updateInventoryMutation.mutate({
      id: selectedItem.departmentInventoryId,
      quantity: Math.max(0, selectedItem.currentStock - parseFloat(updateAmount)),
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
      case 'fulfilled':
        return <Badge className="bg-green-500">{status}</Badge>;
      case 'rejected':
        return <Badge variant="destructive">{status}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const loading = loadingInventory || loadingRequests;

  return (
    <MainLayout title="Kitchen Inventory">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div />
          <Button variant="outline" asChild>
            <a href="/stock-request?department=kitchen">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              Request Stock
            </a>
          </Button>
        </div>

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
                  <CardTitle>Kitchen Inventory Items</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredItems.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground">
                              No items found
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredItems.map((item: DepartmentInventory) => (
                            <TableRow key={item.id}>
                              <TableCell className="font-medium">{item.name}</TableCell>
                              <TableCell>{item.categoryName || 'Uncategorized'}</TableCell>
                              <TableCell>{item.currentStock} {item.unit}</TableCell>
                              <TableCell className="text-right">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleUpdateClick(item)}
                                  disabled={!item.departmentInventoryId || updateInventoryMutation.isPending}
                                >
                                  Update
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="requests" className="mt-6">
            <div className="space-y-6">
              {/* Request Stock Button */}
              <div className="flex justify-end">
                <Button variant="outline" asChild>
                  <a href="/stock-request?department=kitchen">
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    Request Stock
                  </a>
                </Button>
              </div>

              {/* Search */}
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search requests..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Requests Table */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Stock Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Request ID</TableHead>
                          <TableHead>Requested At</TableHead>
                          <TableHead>Items</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRequests.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground">
                              No stock requests found
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredRequests.map((item: StockRequest) => (
                            <TableRow key={item.id}>
                              <TableCell className="font-medium">{item.requestId}</TableCell>
                              <TableCell>{new Date(item.requestedAt).toLocaleString()}</TableCell>
                              <TableCell>
                                {item.requestItems.map(ri => ri.item?.name || `Item ${ri.itemId}`).join(', ')}
                              </TableCell>
                              <TableCell>{getStatusBadge(item.status)}</TableCell>
                            </TableRow>
                          ))
                        )}
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
              <DialogTitle>Update Inventory Usage</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Item Name</Label>
                  <p className="font-medium">{selectedItem?.name}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Current Quantity</Label>
                  <p className="font-medium">{selectedItem?.currentStock} {selectedItem?.unit}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="update-amount">Amount Used</Label>
                <Input
                  id="update-amount"
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder={`Enter amount in ${selectedItem?.unit}`}
                  value={updateAmount}
                  onChange={(e) => setUpdateAmount(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Enter the amount of {selectedItem?.name} that was used
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsUpdateModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateSubmit} disabled={updateInventoryMutation.isPending}>
                {updateInventoryMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Inventory'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
