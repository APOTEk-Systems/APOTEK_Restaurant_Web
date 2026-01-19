import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, AlertCircle, CheckCircle2, Clock, ThumbsDown, RefreshCw, XCircle } from "lucide-react";
import { useState } from "react";

const dissatisfactions = [
  { id: 1, orderId: "ORD-001", table: "Table 5", item: "Grilled Salmon", reason: "Overcooked", status: "pending", time: "10 min ago", resolution: "" },
  { id: 2, orderId: "ORD-008", table: "Table 3", item: "Beef Wellington", reason: "Wrong temperature", status: "remade", time: "25 min ago", resolution: "Remade correctly" },
  { id: 3, orderId: "ORD-012", table: "Table 7", item: "Caesar Salad", reason: "Missing anchovies", status: "resolved", time: "1 hour ago", resolution: "Added anchovies" },
  { id: 4, orderId: "ORD-015", table: "Table 12", item: "Mushroom Risotto", reason: "Too salty", status: "pending", time: "5 min ago", resolution: "" },
  { id: 5, orderId: "ORD-018", table: "Table 2", item: "Chocolate Lava Cake", reason: "Cold center", status: "refunded", time: "45 min ago", resolution: "Full refund issued" },
];

const statusStyles = {
  pending: "bg-amber-500/10 text-amber-500",
  remade: "bg-blue-500/10 text-blue-500",
  resolved: "bg-emerald-500/10 text-emerald-500",
  refunded: "bg-purple-500/10 text-purple-500",
};

const statusIcons = {
  pending: Clock,
  remade: RefreshCw,
  resolved: CheckCircle2,
  refunded: XCircle,
};

export default function KitchenDissatisfactions() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = dissatisfactions.filter((item) =>
    item.item.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.orderId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingCount = dissatisfactions.filter((d) => d.status === "pending").length;

  return (
    <MainLayout title="Dissatisfactions">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dissatisfactions</h1>
            <p className="text-muted-foreground mt-1">Track and resolve customer complaints about food</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Log Dissatisfaction
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-amber-500">{pendingCount}</p>
                </div>
                <Clock className="h-8 w-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Remade</p>
                  <p className="text-2xl font-bold text-blue-500">
                    {dissatisfactions.filter((d) => d.status === "remade").length}
                  </p>
                </div>
                <RefreshCw className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Resolved</p>
                  <p className="text-2xl font-bold text-emerald-500">
                    {dissatisfactions.filter((d) => d.status === "resolved").length}
                  </p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Refunded</p>
                  <p className="text-2xl font-bold text-purple-500">
                    {dissatisfactions.filter((d) => d.status === "refunded").length}
                  </p>
                </div>
                <XCircle className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search dissatisfactions..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Dissatisfactions Table */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ThumbsDown className="h-5 w-5" />
              Dissatisfaction Log
            </CardTitle>
          </CardHeader>
          <CardContent>
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
                  const StatusIcon = statusIcons[item.status as keyof typeof statusIcons];
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.orderId}</TableCell>
                      <TableCell>{item.table}</TableCell>
                      <TableCell>{item.item}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-destructive" />
                          {item.reason}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusStyles[item.status as keyof typeof statusStyles]}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{item.time}</TableCell>
                      <TableCell className="text-right">
                        {item.status === "pending" ? (
                          <div className="flex gap-1 justify-end">
                            <Button size="sm" variant="outline">Remake</Button>
                            <Button size="sm" variant="ghost">Resolve</Button>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">{item.resolution}</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
