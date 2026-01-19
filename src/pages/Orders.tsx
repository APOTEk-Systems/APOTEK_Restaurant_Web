import { MainLayout } from "@/components/layout/MainLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Plus, Search, Filter, Eye, MoreHorizontal, Check, DollarSign, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

const orders = [
  { id: "#ORD-001", customer: "John Smith", table: "Table 5", items: ["Grilled Salmon", "Caesar Salad", "Red Wine"], total: "$86.50", status: "preparing", time: "10:45 AM", waiter: "Sarah M." },
  { id: "#ORD-002", customer: "Emily Chen", table: "Table 12", items: ["Ribeye Steak", "Mashed Potatoes"], total: "$72.00", status: "served", time: "10:32 AM", waiter: "Mike R." },
  { id: "#ORD-003", customer: "Robert Johnson", table: "Table 3", items: ["Margherita Pizza", "Tiramisu", "Espresso"], total: "$45.00", status: "pending", time: "10:28 AM", waiter: "Sarah M." },
  { id: "#ORD-004", customer: "Maria Garcia", table: "Table 8", items: ["Chicken Parmesan", "House Salad", "Sparkling Water"], total: "$52.50", status: "preparing", time: "10:15 AM", waiter: "James T." },
  { id: "#ORD-005", customer: "David Lee", table: "Table 1", items: ["Lobster Bisque", "Filet Mignon", "Cheesecake"], total: "$124.00", status: "completed", time: "10:02 AM", waiter: "Mike R." },
  { id: "#ORD-006", customer: "Sophie Williams", table: "Table 7", items: ["Pasta Carbonara", "Garlic Bread"], total: "$38.00", status: "served", time: "9:55 AM", waiter: "Sarah M." },
];

const statusStyles = {
  pending: "bg-warning/10 text-warning border-warning/20",
  preparing: "bg-primary/10 text-primary border-primary/20",
  served: "bg-success/10 text-success border-success/20",
  completed: "bg-muted text-muted-foreground border-border",
};

export default function Orders() {
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewOrder = (order: any) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleStatusUpdate = (orderId: string, newStatus: string) => {
    console.log(`Updating order ${orderId} to status: ${newStatus}`);
    if (newStatus === "paid") {
      // Navigate to payment page for recording payment details
      window.location.href = `/order/${orderId.replace('#', '')}/pay`;
    }
    setIsModalOpen(false);
  };

  const handleCancelOrder = (orderId: string) => {
    console.log(`Cancelling order ${orderId}`);
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

  return (
    <MainLayout title="Orders" subtitle="Manage and track all restaurant orders">
      <div className="space-y-6 animate-fade-in">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-3">
            <div className="relative flex-1 sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search orders..." className="pl-9" />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="preparing">Preparing</SelectItem>
                <SelectItem value="served">Served</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
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
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-medium text-foreground">{order.id}</span>
                      <p className="text-xs text-muted-foreground">{order.time}</p>
                    </td>
                    <td className="px-6 py-4 text-foreground">{order.customer}</td>
                    <td className="px-6 py-4 text-foreground">{order.table}</td>
                    <td className="px-6 py-4 text-foreground">{order.waiter}</td>
                    <td className="px-6 py-4">
                      <Badge className={cn("capitalize", statusStyles[order.status as keyof typeof statusStyles])}>
                        {order.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 font-semibold text-foreground">{order.total}</td>
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
                              <DialogTitle>Order Details - {selectedOrder?.id}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm text-muted-foreground">Customer</p>
                                  <p className="font-medium">{selectedOrder?.customer}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Table</p>
                                  <p className="font-medium">{selectedOrder?.table}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Waiter</p>
                                  <p className="font-medium">{selectedOrder?.waiter}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Status</p>
                                  <Badge className={cn("capitalize", statusStyles[selectedOrder?.status as keyof typeof statusStyles])}>
                                    {selectedOrder?.status}
                                  </Badge>
                                </div>
                              </div>

                              <div>
                                <p className="text-sm text-muted-foreground mb-2">Items</p>
                                <div className="space-y-2">
                                  {selectedOrder?.items.map((item: string, index: number) => (
                                    <div key={index} className="flex justify-between items-center p-2 rounded-lg bg-muted/30">
                                      <span className="text-sm">{item}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="flex justify-between items-center pt-4 border-t border-border">
                                <p className="text-sm text-muted-foreground">Total</p>
                                <p className="font-semibold text-lg">{selectedOrder?.total}</p>
                              </div>
                            </div>
                            <DialogFooter className="gap-2">
                              {getStatusActions(selectedOrder?.status, selectedOrder?.id)}
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        {/* <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button> */}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
