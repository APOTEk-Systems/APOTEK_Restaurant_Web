import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, Plus, AlertCircle, CheckCircle2, Clock, ThumbsDown, RefreshCw, XCircle, Loader2, MoreHorizontal } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { dissatisfactionService, Dissatisfaction, DissatisfactionStatus } from "@/services/dissatisfactionService";
import { OrderService, Order, OrderItem } from "@/services/orderService";
import { useToast } from "@/hooks/use-toast";

const statusStyles: Record<string, string> = {
  PENDING: "bg-amber-500/10 text-amber-500",
  REMADE: "bg-blue-500/10 text-blue-500",
  RESOLVED: "bg-emerald-500/10 text-emerald-500",
  REFUNDED: "bg-purple-500/10 text-purple-500",
};

const statusIcons: Record<string, typeof Clock> = {
  PENDING: Clock,
  REMADE: RefreshCw,
  RESOLVED: CheckCircle2,
  REFUNDED: XCircle,
};

const formatStatus = (status: string) => {
  return status.charAt(0) + status.slice(1).toLowerCase();
};

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
};

export default function KitchenDissatisfactions() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isResolveDialogOpen, setIsResolveDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Dissatisfaction | null>(null);
  const [resolution, setResolution] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    orderId: "",
    orderNumber: "",
    tableNumber: "",
    selectedItem: "",
    reason: "",
  });
  
  // For order selection
  const [orderSearchTerm, setOrderSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [kitchenItems, setKitchenItems] = useState<OrderItem[]>([]);

  // Fetch dissatisfactions using React Query
  const { data: dissatisfactions = [], isLoading } = useQuery({
    queryKey: ['dissatisfactions'],
    queryFn: () => dissatisfactionService.getAll(),
  });

  // Fetch recent orders using React Query
  const { data: orders = [] } = useQuery({
    queryKey: ['orders', 'recent'],
    queryFn: async () => {
      const data = await OrderService.getRecentOrders();
      return data.filter((order: Order) => order.status !== 'CANCELLED');
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: { orderId: number; tableNumber: number; itemName: string; reason: string }) =>
      dissatisfactionService.create(data),
    onSuccess: () => {
      toast({ title: "Success", description: "Dissatisfaction logged successfully" });
      setIsCreateDialogOpen(false);
      resetCreateForm();
      queryClient.invalidateQueries({ queryKey: ['dissatisfactions'] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.response?.data?.message || "Failed to log dissatisfaction", variant: "destructive" });
    },
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { status: DissatisfactionStatus; resolution?: string } }) =>
      dissatisfactionService.updateStatus(id, data),
    onSuccess: () => {
      toast({ title: "Success", description: "Status updated successfully" });
      queryClient.invalidateQueries({ queryKey: ['dissatisfactions'] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    },
  });

  const filteredItems = dissatisfactions.filter((item) =>
    item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.orderId.toString().includes(searchQuery)
  );

  const pendingCount = dissatisfactions.filter((d) => d.status === "PENDING").length;
  const remadeCount = dissatisfactions.filter((d) => d.status === "REMADE").length;
  const resolvedCount = dissatisfactions.filter((d) => d.status === "RESOLVED").length;
  const refundedCount = dissatisfactions.filter((d) => d.status === "REFUNDED").length;

  const handleOrderSelect = (orderId: string) => {
    const order = orders.find((o: Order) => o.id === parseInt(orderId));
    if (order) {
      setSelectedOrder(order);
      setFormData({
        ...formData,
        orderId: orderId,
        orderNumber: order.orderNumber.toString(),
        tableNumber: order.tableNumber?.toString() || "",
        selectedItem: "",
      });
      const items = order.orderItems?.filter((item: OrderItem) => item.prepArea === 'KITCHEN') || [];
      setKitchenItems(items);
    }
  };

  const handleItemSelect = (itemId: string) => {
    setFormData({
      ...formData,
      selectedItem: itemId,
    });
  };

  const resetCreateForm = () => {
    setFormData({ orderId: "", orderNumber: "", tableNumber: "", selectedItem: "", reason: "" });
    setSelectedOrder(null);
    setKitchenItems([]);
    setOrderSearchTerm("");
  };

  const handleCreate = () => {
    if (!formData.orderId || !formData.selectedItem || !formData.reason) {
      toast({
        title: "Validation Error",
        description: "Please select an order, item, and provide a reason",
        variant: "destructive",
      });
      return;
    }

    const selectedItemData = kitchenItems.find(item => item.id === parseInt(formData.selectedItem));

    createMutation.mutate({
      orderId: parseInt(formData.orderId),
      tableNumber: parseInt(formData.tableNumber) || 0,
      itemName: selectedItemData?.menuItem?.name || formData.selectedItem,
      reason: formData.reason,
    });
  };

  const handleRemake = (item: Dissatisfaction) => {
    updateStatusMutation.mutate({
      id: item.id,
      data: { status: "REMADE" as DissatisfactionStatus, resolution: "Item is being remade" }
    });
  };

  const handleResolve = (item: Dissatisfaction) => {
    setSelectedItem(item);
    setResolution("");
    setIsResolveDialogOpen(true);
  };

  const submitResolve = () => {
    if (!selectedItem) return;
    updateStatusMutation.mutate({
      id: selectedItem.id,
      data: { status: "RESOLVED" as DissatisfactionStatus, resolution }
    });
    setIsResolveDialogOpen(false);
    setSelectedItem(null);
    setResolution("");
  };

  const handleRefund = (item: Dissatisfaction) => {
    updateStatusMutation.mutate({
      id: item.id,
      data: { status: "REFUNDED" as DissatisfactionStatus, resolution: "Full refund issued" }
    });
  };

  return (
    <MainLayout title="Kitchen Issues" subtitle="Track and resolve customer complaints about food">
      <div className="space-y-6">
       

        {/* Search and Add */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search Issues..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Issue
          </Button>
        </div>

        {/* Dissatisfactions Table */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ThumbsDown className="h-5 w-5" />
              Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No Issues found.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Table</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => {
                    const StatusIcon = statusIcons[item.status] || Clock;
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">ORD-{item.orderId}</TableCell>
                        <TableCell>Table {item.tableNumber}</TableCell>
                        <TableCell>{item.itemName}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-destructive" />
                            {item.reason}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusStyles[item.status] || ""}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {formatStatus(item.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatTimeAgo(item.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.status === "PENDING" ? (
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  disabled={updateStatusMutation.isPending}
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent align="end" className="w-40">
                                <div className="flex flex-col gap-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleRemake(item)}
                                    disabled={updateStatusMutation.isPending}
                                    className="w-full justify-start"
                                  >
                                    <RefreshCw className="h-3 w-3 mr-2" />
                                    Remake
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleResolve(item)}
                                    disabled={updateStatusMutation.isPending}
                                    className="w-full justify-start"
                                  >
                                    <CheckCircle2 className="h-3 w-3 mr-2" />
                                    Resolve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleRefund(item)}
                                    disabled={updateStatusMutation.isPending}
                                    className="w-full justify-start text-purple-500 hover:text-purple-600"
                                  >
                                    <XCircle className="h-3 w-3 mr-2" />
                                    Refund
                                  </Button>
                                </div>
                              </PopoverContent>
                            </Popover>
                          ) : (
                            <span className="text-sm text-muted-foreground">{item.resolution}</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
        setIsCreateDialogOpen(open);
        if (!open) resetCreateForm();
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Dissatisfaction</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Order Selection */}
            <div className="space-y-2">
              <Label htmlFor="orderSelect">Select Order *</Label>
              <select
                id="orderSelect"
                title="Select an order"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.orderId}
                onChange={(e) => handleOrderSelect(e.target.value)}
              >
                <option value="">Select an order...</option>
                {orders
                  .filter(order =>
                    order.orderNumber.toString().includes(orderSearchTerm) ||
                    orderSearchTerm === ""
                  )
                  .map(order => (
                    <option key={order.id} value={order.id}>
                      Order #{order.orderNumber} - Table {order.tableNumber || 'N/A'}
                    </option>
                  ))}
              </select>
              <Input
                placeholder="Search by order number..."
                value={orderSearchTerm}
                onChange={(e) => setOrderSearchTerm(e.target.value)}
                className="mt-2"
              />
            </div>

            {/* Item Selection - shown after order is selected */}
            {selectedOrder && kitchenItems.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="itemSelect">Select Item *</Label>
                <select
                  id="itemSelect"
                  title="Select an item"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.selectedItem}
                  onChange={(e) => handleItemSelect(e.target.value)}
                >
                  <option value="">Select an item...</option>
                  {kitchenItems.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.menuItem?.name || `Item #${item.id}`} (x{item.quantity})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {selectedOrder && kitchenItems.length === 0 && (
              <p className="text-sm text-muted-foreground">No kitchen items found in this order.</p>
            )}

            <div className="space-y-2">
              <Label htmlFor="reason">Reason *</Label>
              <Textarea
                id="reason"
                placeholder="Describe the issue with the food..."
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsCreateDialogOpen(false);
              resetCreateForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending || !formData.selectedItem}>
              {createMutation.isPending ? "Saving..." : "Log Dissatisfaction"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resolve Dialog */}
      <Dialog open={isResolveDialogOpen} onOpenChange={setIsResolveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Issue</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="font-medium">{selectedItem?.itemName}</p>
              <p className="text-sm text-muted-foreground">{selectedItem?.reason}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="resolution">Resolution Notes</Label>
              <Textarea
                id="resolution"
                placeholder="How was this issue resolved?"
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResolveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitResolve} disabled={updateStatusMutation.isPending}>
              {updateStatusMutation.isPending ? "Saving..." : "Mark as Resolved"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
