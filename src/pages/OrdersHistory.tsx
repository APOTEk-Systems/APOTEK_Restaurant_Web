import { useState } from "react";
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
import { Search, Filter, Download, Eye, Calendar, DollarSign, Receipt } from "lucide-react";

const historyOrders = [
  { id: "ORD-001", table: "Table 5", items: 4, total: 89.50, date: "2024-01-08", time: "19:30", waiter: "Sarah M.", paymentMethod: "Card" },
  { id: "ORD-002", table: "Table 3", items: 2, total: 45.00, date: "2024-01-08", time: "18:15", waiter: "John D.", paymentMethod: "Cash" },
  { id: "ORD-003", table: "Table 8", items: 6, total: 156.75, date: "2024-01-07", time: "20:45", waiter: "Mike R.", paymentMethod: "Card" },
  { id: "ORD-004", table: "Table 1", items: 3, total: 67.25, date: "2024-01-07", time: "19:00", waiter: "Sarah M.", paymentMethod: "Card" },
  { id: "ORD-005", table: "Table 12", items: 5, total: 112.00, date: "2024-01-06", time: "21:30", waiter: "Emily S.", paymentMethod: "Cash" },
  { id: "ORD-006", table: "Table 7", items: 2, total: 38.50, date: "2024-01-06", time: "17:45", waiter: "John D.", paymentMethod: "Card" },
  { id: "ORD-007", table: "Table 4", items: 8, total: 198.00, date: "2024-01-05", time: "20:00", waiter: "Mike R.", paymentMethod: "Card" },
  { id: "ORD-008", table: "Table 9", items: 3, total: 54.25, date: "2024-01-05", time: "18:30", waiter: "Sarah M.", paymentMethod: "Cash" },
];

const stats = [
  { title: "Total Orders", value: "1,284", icon: Receipt, change: "+12%" },
  { title: "Total Revenue", value: "$45,890", icon: DollarSign, change: "+8%" },
  { title: "This Month", value: "342", icon: Calendar, change: "+15%" },
];

export default function OrdersHistory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("all");

  const filteredOrders = historyOrders.filter(order =>
    order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.table.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.waiter.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout title="Orders History" subtitle="View past completed orders">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="card-hover">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  <span className="text-xs text-emerald-500">{stat.change} vs last period</span>
                </div>
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by order ID, table, or waiter..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant={dateFilter === "all" ? "default" : "outline"} 
                size="sm"
                onClick={() => setDateFilter("all")}
              >
                All Time
              </Button>
              <Button 
                variant={dateFilter === "week" ? "default" : "outline"} 
                size="sm"
                onClick={() => setDateFilter("week")}
              >
                This Week
              </Button>
              <Button 
                variant={dateFilter === "month" ? "default" : "outline"} 
                size="sm"
                onClick={() => setDateFilter("month")}
              >
                This Month
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Table</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Waiter</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>
                    <div>
                      <span className="text-sm">{order.date}</span>
                      <span className="text-xs text-muted-foreground ml-2">{order.time}</span>
                    </div>
                  </TableCell>
                  <TableCell>{order.table}</TableCell>
                  <TableCell>{order.items} items</TableCell>
                  <TableCell>{order.waiter}</TableCell>
                  <TableCell>
                    <Badge variant={order.paymentMethod === "Card" ? "default" : "secondary"}>
                      {order.paymentMethod}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">${order.total.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </MainLayout>
  );
}
