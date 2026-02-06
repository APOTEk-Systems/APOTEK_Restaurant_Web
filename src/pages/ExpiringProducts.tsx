import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Plus, Search, AlertTriangle, Clock, Trash2, Package, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { batchService, type Batch } from "@/services/batchService";
import { api } from "@/services/api";

const statusStyles = {
  critical: "bg-red-500/10 text-red-500 border-red-500/20",
  warning: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  normal: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
};

const getDaysLeft = (expiryDate?: string): number => {
  if (!expiryDate) return 999;
  const expiry = new Date(expiryDate);
  const today = new Date();
  const diffTime = expiry.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const getStatus = (daysLeft: number): "critical" | "warning" | "normal" => {
  if (daysLeft <= 2) return "critical";
  if (daysLeft <= 5) return "warning";
  return "normal";
};

const getProgressColor = (daysLeft: number) => {
  if (daysLeft <= 2) return "bg-red-500";
  if (daysLeft <= 5) return "bg-amber-500";
  return "bg-emerald-500";
};

const ExpiringProducts = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch expiring batches from API
  const { data: batches = [], isLoading, isError, error } = useQuery({
    queryKey: ["expiringBatches"],
    queryFn: async () => {
      const response = await api.get(`/batches/expiring?days=10`);
      return response.data as Batch[];
    },
  });

  // Calculate days left and status for each batch
  const processedBatches = batches.map((batch) => ({
    ...batch,
    daysLeft: getDaysLeft(batch.expiryDate),
    status: getStatus(getDaysLeft(batch.expiryDate)),
  }));

  // Filter batches based on search
  const filteredBatches = processedBatches.filter((batch) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      batch.batchNumber?.toLowerCase().includes(searchLower) ||
      batch.inventoryItem?.name?.toLowerCase().includes(searchLower)
    );
  });

  // Calculate stats
  const criticalCount = processedBatches.filter((b) => b.status === "critical").length;
  const warningCount = processedBatches.filter((b) => b.status === "warning").length;

  return (
    <MainLayout title="Expiring Products" subtitle="Manage inventory batches and expiration dates">
      <div className="space-y-6">
        {/* Summary Cards */}
        {/* <div className="grid gap-4 md:grid-cols-4">
          <Card className="glass-card border-red-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                Critical (≤2 days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{isLoading ? "..." : criticalCount}</div>
            </CardContent>
          </Card>
          <Card className="glass-card border-amber-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-500" />
                Warning (3-5 days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-500">{isLoading ? "..." : warningCount}</div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Package className="h-4 w-4" />
                Total Batches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{isLoading ? "..." : processedBatches.length}</div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Expired This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-muted-foreground">0</div>
            </CardContent>
          </Card>
        </div> */}

        {/* Search and Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search batches..."
              className="pl-9 glass-card"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Error State */}
        {isError && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <p className="text-destructive">Failed to load expiring products: {error instanceof Error ? error.message : "Unknown error"}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Loading expiring products...</span>
          </div>
        ) : (
          /* Batches Table */
          <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Batch Number</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-center">Quantity</TableHead>
                    <TableHead>Received</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead className="text-center">Days Left</TableHead>
                    <TableHead>Status</TableHead>
                    {/* <TableHead className="text-right">Actions</TableHead> */}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBatches.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                        No expiring products found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBatches.map((batch) => (
                      <TableRow key={batch.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-medium">{batch.batchNumber}</TableCell>
                        <TableCell>{batch.inventoryItem?.name || `Item #${batch.inventoryItemId}`}</TableCell>
                        <TableCell className="text-center">
                          {batch.quantity} {batch.inventoryItem?.unit}
                        </TableCell>
                        <TableCell>
                          {batch.createdAt ? new Date(batch.createdAt).toLocaleDateString() : "-"}
                        </TableCell>
                        <TableCell>
                          {batch.expiryDate ? new Date(batch.expiryDate).toLocaleDateString() : "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className={cn(
                              "font-bold",
                              batch.status === "critical" ? "text-red-500" :
                              batch.status === "warning" ? "text-amber-500" : "text-emerald-500"
                            )}>
                              {batch.daysLeft} days
                            </span>
                            <Progress
                              value={Math.max(0, Math.min(100, (14 - batch.daysLeft) / 14 * 100))}
                              className={cn("h-1 w-16", getProgressColor(batch.daysLeft))}
                            />
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <Badge className={statusStyles[batch.status]}>
                            {batch.status === "critical" && <AlertTriangle className="h-3 w-3 mr-1" />}
                            {batch.status === "warning" && <Clock className="h-3 w-3 mr-1" />}
                            {batch.status === "normal" && <Package className="h-3 w-3 mr-1" />}
                            {batch.status.charAt(0).toUpperCase() + batch.status.slice(1)}
                          </Badge>
                        </TableCell>
                        {/* <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline">
                              Use Stock
                            </Button>
                            <Button size="sm" variant="ghost" className="text-red-500 hover:bg-red-500/10">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell> */}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ExpiringProducts;
