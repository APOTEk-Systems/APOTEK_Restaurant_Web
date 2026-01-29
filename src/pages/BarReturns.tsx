import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, AlertCircle, RotateCcw } from "lucide-react";
import { useState } from "react";
import { returns, statusStyles, statusIcons } from "@/data/barReturnsData";

export default function BarReturns() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = returns.filter((item) =>
    item.item.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.orderId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingCount = returns.filter((d) => d.status === "pending").length;

  return (
    <MainLayout title="Bar Returns">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Bar Returns</h1>
            <p className="text-muted-foreground mt-1">Track and resolve drink returns and complaints</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Log Return
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
                    {returns.filter((d) => d.status === "remade").length}
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
                    {returns.filter((d) => d.status === "resolved").length}
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
                    {returns.filter((d) => d.status === "refunded").length}
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
            placeholder="Search returns..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Returns Table */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5" />
              Returns Log
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
