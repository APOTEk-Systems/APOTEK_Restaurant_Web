import { MainLayout } from "@/components/layout/MainLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Plus, Search, Filter, Eye, MoreHorizontal, Check, DollarSign, X, Ban } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { OrderService } from "@/services/orderService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const statusStyles = {
  pending: "bg-warning/10 text-warning border-warning/20",
  preparing: "bg-primary/10 text-primary border-primary/20",
  served: "bg-success/10 text-success border-success/20",
  completed: "bg-muted text-muted-foreground border-border",
  paid: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

export default function Orders() {
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const queryClient = useQueryClient();

  // Fetch recent orders using React Query
  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['recentOrders'],
    queryFn: OrderService.getRecentOrders,
  });

  // Mutation for updating order status
  const updateOrderMutation = useMutation({
    mutationFn: (params: { id: number; status: string }) =>
      OrderService.updateOrder(params.id, { status: params.status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recentOrders'] });
    },
  });

  // Mutation for updating kitchen order status
  const updateKitchenOrderMutation = useMutation({
    mutationFn: (params: { id: number; status: string }) =>
      OrderService.updateKitchenOrderStatus(params.id, { status: params.status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recentOrders'] });
    },
  });

  // Mutation for updating bar order status
  const updateBarOrderMutation = useMutation({
    mutationFn: (params: { id: number; status: string }) =>
      OrderService.updateBarOrderStatus(params.id, { status: params.status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recentOrders'] });
    },
  });

  const handleViewOrder = (order: any) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleStatusUpdate = (orderId: string, newStatus: string) => {
    const numericOrderId = parseInt(orderId.replace('#', ''));
    console.log(`Updating order ${orderId} to status: ${newStatus}`);

    if (newStatus === "paid") {
      // Navigate to payment page for recording payment details
      window.location.href = `/order/${numericOrderId}/pay`;
    } else {
      // Update the order status
      updateOrderMutation.mutate({ id: numericOrderId, status: newStatus });
    }
    setIsModalOpen(false);
  };

  const handleCancelOrder = (orderId: string) => {
    const numericOrderId = parseInt(orderId.replace('#', ''));
    console.log(`Cancelling order ${orderId}`);
    updateOrderMutation.mutate({ id: numericOrderId, status: "cancelled" });
    setIsModalOpen(false);
  };

  const getStatusActions = (status: string, orderId: string) => {
    switch (status) {
      case "completed":
        return (
          <>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => handleStatusUpdate(orderId, "served")}
            >
              <Check className="h-4 w-4" />
              Update to Served
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => handleStatusUpdate(orderId, "paid")}
            >
              <DollarSign className="h-4 w-4" />
              Update to Paid
            </Button>
          </>
        );
      case "served":
        return (
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => handleStatusUpdate(orderId, "paid")}
          >
            <DollarSign className="h-4 w-4" />
            Record Payment
          </Button>
        );
      case "pending":
      case "preparing":
        return (
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
            onClick={() => handleCancelOrder(orderId)}
          >
            <X className="h-4 w-4" />
            Cancel Order
          </Button>
        );
      default:
        return null;
    }
  };

  // Filter and search orders
  const filteredOrders = orders?.filter(order => {
    const matchesSearch = searchTerm === "" ||
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toString().includes(searchTerm) ||
      order.tableNumber.toString().includes(searchTerm);

    const matchesStatus = statusFilter === "all" || order.status.toLowerCase() === statusFilter;

    return matchesSearch && matchesStatus;
  }) || [];

  if (isLoading) {
    return (
      <MainLayout title="Orders" subtitle="Manage and track all restaurant orders">
        <div className="space-y-6 animate-fade-in">
          <div className="text-center py-8">Loading orders...</div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout title="Orders" subtitle="Manage and track all restaurant orders">
        <div className="space-y-6 animate-fade-in">
          <div className="text-center py-8 text-destructive">Error loading orders: {error.message}</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Orders" subtitle="Manage and track all restaurant orders">
      <div className="space-y-6 animate-fade-in">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-3">
            <div className="relative flex-1 sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="preparing">Preparing</SelectItem>
                <SelectItem value="served">Served</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Link to="/orders/new">
            <Button className="gradient-primary text-primary-foreground shadow-glow hover:shadow-lg transition-shadow">
              <Plus className="h-4 w-4 mr-2" />
              New Order
            </Button>
          </Link>
        </div>

        {/* Orders Table */}
        <div className="bg-card rounded-xl shadow-card border border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Order ID</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Customer</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Table</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Waiter</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Total</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-medium text-foreground">#{order.orderNumber}</span>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.createdAt).toLocaleTimeString().slice(0, 5)}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-foreground">{order.customerName || 'N/A'}</td>
                      <td className="px-6 py-4 text-foreground">{order.tableNumber}</td>
                      <td className="px-6 py-4 text-foreground">{order.waiter || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <Badge className={cn("capitalize", statusStyles[order.status.toLowerCase() as keyof typeof statusStyles])}>
                          {order.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 font-semibold text-foreground">${order.total.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleViewOrder(order)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                              <DialogHeader>
                                <DialogTitle>Order Details - #{selectedOrder?.orderNumber}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm text-muted-foreground">Customer</p>
                                    <p className="font-medium">{selectedOrder?.customerName || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Table</p>
                                    <p className="font-medium">{selectedOrder?.tableNumber}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Waiter</p>
                                    <p className="font-medium">{selectedOrder?.waiter || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Status</p>
                                    <Badge className={cn("capitalize", statusStyles[selectedOrder?.status.toLowerCase() as keyof typeof statusStyles])}>
                                      {selectedOrder?.status}
                                    </Badge>
                                  </div>
                                </div>

                                <div>
                                  <p className="text-sm text-muted-foreground mb-2">Items</p>
                                  <div className="space-y-2">
                                    {selectedOrder?.orderItems.map((item: any, index: number) => (
                                      <div key={index} className="flex justify-between items-center p-2 rounded-lg bg-muted/30">
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm font-medium">{item.menuItem.name || 'Item'}</span>
                                          <span className="text-xs text-muted-foreground">x{item.quantity}</span>
                                          
                                        </div>
                                        <div className="flex items-center">
                                        <span className="text-sm font-semibold">${item.price.toFixed(2)}</span>
                                        {item.status === 'PENDING' && (
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-6 w-6 p-0 text-destructive hover:bg-destructive ml-3"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                console.log(`Cancel item ${item.id}`);
                                                // Add cancel item logic here
                                              }}
                                            >
                                              <Ban className="h-3 w-3" />
                                            </Button>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div className="flex justify-between items-center pt-4 border-t border-border">
                                  <p className="text-sm text-muted-foreground">Total</p>
                                  <p className="font-semibold text-lg">${selectedOrder?.total.toFixed(2)}</p>
                                </div>
                              </div>
                              <DialogFooter className="gap-2">
                                {getStatusActions(selectedOrder?.status.toLowerCase(), `#${selectedOrder?.orderNumber}`)}
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-muted-foreground">
                      No orders found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
