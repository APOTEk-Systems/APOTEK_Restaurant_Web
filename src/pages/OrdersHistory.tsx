import { useState, useMemo } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Filter, Download, Eye, Calendar, DollarSign, Receipt, Loader2, CreditCard, Banknote, Wallet } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { OrderService, Order, Payment } from "@/services/orderService";
import { DateRangePicker, DateRange } from "@/components/ui/date-range-picker";
import { cn, formatCurrency } from "@/lib/utils";
import { format } from "date-fns";

const paymentMethodStyles = {
  CASH: "bg-success/10 text-success",
  CARD: "bg-primary/10 text-primary",
  ONLINE: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
};

export default function OrdersHistory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [statusFilter, setStatusFilter] = useState<string>("PAID");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  // Fetch orders with date range filter
  const { data: orders = [], isLoading, error } = useQuery({
    queryKey: ['orders-history', dateRange, statusFilter],
    queryFn: async () => {
      const params: any = {};
      
      if (dateRange?.from && dateRange?.to) {
        params.startDate = dateRange.from.toISOString();
        params.endDate = dateRange.to.toISOString();
      }
      
      if (statusFilter !== "all") {
        params.status = statusFilter;
      }
      
      return OrderService.getAllOrders(params);
    },
  });

  // Filter orders by search query
  const filteredOrders = useMemo(() => {
    return orders.filter((order: Order) => {
      const matchesSearch = 
        order.orderNumber?.toString().includes(searchQuery.toLowerCase()) ||
        order.tableNumber?.toString().includes(searchQuery.toLowerCase()) ||
        order.waiter?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerName?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [orders, searchQuery]);

  // Calculate stats from filtered orders
  const stats = useMemo(() => {
    const totalRevenue = filteredOrders.reduce((sum: number, order: Order) => sum + (order.total || 0), 0);
    const totalOrders = filteredOrders.length;
    const totalItems = filteredOrders.reduce((sum: number, order: Order) => 
      sum + (order.orderItems?.length || 0), 0);
    
    return {
      totalOrders,
      totalRevenue,
      totalItems,
    };
  }, [filteredOrders]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
  };

  return (
    <MainLayout title="Orders History" subtitle="View past completed orders">
     

      {/* Filters */}
    
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by order ID, table, waiter, or customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <DateRangePicker 
                dateRange={dateRange}
                onDateRangeChange={handleDateRangeChange}
              />
            
              
            </div>
          </div>
        

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Completed Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-destructive">
              Failed to load orders. Please try again.
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No orders found. Try adjusting your filters.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Table</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Waiter</TableHead>
                  {/* <TableHead>Payment</TableHead> */}
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order: Order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.orderNumber}</TableCell>
                    <TableCell>
                      <div>
                        <span className="text-sm">{format(order.createdAt, "dd/MM/yyyy")}</span>
                        <span className="text-xs text-muted-foreground ml-2 block">{formatTime(order.createdAt)}</span>
                      </div>
                    </TableCell>
                    <TableCell>Table {order.tableNumber || 'N/A'}</TableCell>
                    <TableCell>{order.orderItems?.length || 0} items</TableCell>
                    <TableCell>{order.waiter || 'N/A'}</TableCell>
                    {/* <TableCell>
                      {order.payments && order.payments.length > 0 ? (
                        <Badge className={cn(paymentMethodStyles[order.payments[0].paymentMethod as keyof typeof paymentMethodStyles] || "bg-muted")}>
                          {order.payments[0].paymentMethod}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell> */}
                    <TableCell>
                      <Badge variant={order.status === "COMPLETED" || order.status === "PAID" ? "default" : "destructive"}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(order.total || 0)}</TableCell>
                    <TableCell className="text-right">
                      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowPaymentDialog(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Payment Details - Order #{selectedOrder?.orderNumber}</DialogTitle>
                          </DialogHeader>
                          {selectedOrder?.payments && selectedOrder.payments.length > 0 ? (
                            <div className="space-y-4">
                              {selectedOrder.payments.map((payment: Payment, index: number) => (
                                <div key={payment.id} className="p-4 border rounded-lg space-y-3">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Payment #{index + 1}</span>
                                    <Badge className={cn(
                                      payment.paymentMethod === 'CASH' && "bg-success/10 text-success",
                                      payment.paymentMethod === 'CARD' && "bg-primary/10 text-primary",
                                      payment.paymentMethod === 'ONLINE' && "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                                    )}>
                                      {payment.paymentMethod === 'CASH' && <Banknote className="h-3 w-3 mr-1" />}
                                      {payment.paymentMethod === 'CARD' && <CreditCard className="h-3 w-3 mr-1" />}
                                      {payment.paymentMethod === 'ONLINE' && <Wallet className="h-3 w-3 mr-1" />}
                                      {payment.paymentMethod}
                                    </Badge>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Amount</span>
                                    <span className="font-semibold text-lg">{formatCurrency(payment.amount)}</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Status</span>
                                    <Badge variant={payment.status === 'COMPLETED' ? 'default' : 'destructive'}>
                                      {payment.status}
                                    </Badge>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Date</span>
                                    <span className="text-sm">
                                      {new Date(payment.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                        hour: 'numeric',
                                        minute: '2-digit'
                                      })}
                                    </span>
                                  </div>
                                  {payment.transactionId && (
                                    <div className="flex justify-between items-center">
                                      <span className="text-muted-foreground">Transaction ID</span>
                                      <span className="text-xs font-mono">{payment.transactionId}</span>
                                    </div>
                                  )}
                                </div>
                              ))}
                              <div className="pt-4 border-t flex justify-between items-center">
                                <span className="font-semibold">Total Paid</span>
                                <span className="font-bold text-lg text-success">
                                  {formatCurrency(selectedOrder.payments.reduce((sum: number, p: Payment) => sum + p.amount, 0))}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-8 text-muted-foreground">
                              No payment records found for this order.
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </MainLayout>
  );
}
