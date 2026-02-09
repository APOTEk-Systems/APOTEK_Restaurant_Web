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
import { Search, Filter, Download, Eye, Calendar, DollarSign, Receipt, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { OrderService, Order } from "@/services/orderService";
import { DateRangePicker, DateRange } from "@/components/ui/date-range-picker";
import { cn, formatCurrency } from "@/lib/utils";

const paymentMethodStyles = {
  CASH: "bg-success/10 text-success",
  CARD: "bg-primary/10 text-primary",
  ONLINE: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
};

export default function OrdersHistory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [statusFilter, setStatusFilter] = useState<string>("all");

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
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
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
              <Button 
                variant={statusFilter === "all" ? "default" : "outline"} 
                size="sm"
                onClick={() => setStatusFilter("all")}
              >
                All Status
              </Button>
              <Button 
                variant={statusFilter === "COMPLETED" ? "default" : "outline"} 
                size="sm"
                onClick={() => setStatusFilter("COMPLETED")}
              >
                Completed
              </Button>
              <Button 
                variant={statusFilter === "PAID" ? "default" : "outline"} 
                size="sm"
                onClick={() => setStatusFilter("PAID")}
              >
                Paid
              </Button>
              <Button 
                variant={statusFilter === "CANCELLED" ? "default" : "outline"} 
                size="sm"
                onClick={() => setStatusFilter("CANCELLED")}
              >
                Cancelled
              </Button>
              
            </div>
          </div>
        </CardContent>
      </Card>

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
                  <TableHead>Date & Time</TableHead>
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
                        <span className="text-sm">{formatDate(order.createdAt)}</span>
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
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
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
