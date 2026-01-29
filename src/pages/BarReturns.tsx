import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, AlertCircle, RotateCcw, Clock, RefreshCw, CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { barReturnsService } from "@/services/barReturnsService";
import { BarReturn, BarReturnStatus } from "@/types/barReturn";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/dashboard/StatCard";

// Define status styles and icons locally as they are presentation specific
const statusStyles: Record<BarReturnStatus, string> = {
  [BarReturnStatus.PENDING]: "bg-amber-500/10 text-amber-500",
  [BarReturnStatus.REMADE]: "bg-blue-500/10 text-blue-500",
  [BarReturnStatus.RESOLVED]: "bg-emerald-500/10 text-emerald-500",
  [BarReturnStatus.REFUNDED]: "bg-purple-500/10 text-purple-500",
};

const statusIcons: Record<BarReturnStatus, React.ElementType> = {
  [BarReturnStatus.PENDING]: Clock,
  [BarReturnStatus.REMADE]: RefreshCw,
  [BarReturnStatus.RESOLVED]: CheckCircle2,
  [BarReturnStatus.REFUNDED]: XCircle,
};

export default function BarReturns() {
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: barReturns, isLoading, isError, error } = useQuery<BarReturn[]>({
    queryKey: ["barReturns"],
    queryFn: barReturnsService.getBarReturns,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, resolution }: { id: number; status: BarReturnStatus; resolution?: string }) =>
      barReturnsService.updateBarReturnStatus(id, { status, resolution }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["barReturns"] });
      toast({
        title: "Success!",
        description: "Bar return status updated.",
      });
    },
    onError: (err) => {
      toast({
        title: "Error",
        description: `Failed to update status: ${err.message}`,
        variant: "destructive",
      });
    },
  });

  const handleUpdateStatus = (id: number, status: BarReturnStatus, resolution?: string) => {
    updateStatusMutation.mutate({ id, status, resolution });
  };

  const filteredItems = barReturns?.filter((item) =>
    item.item.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.orderId.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const pendingCount = barReturns?.filter((d) => d.status === BarReturnStatus.PENDING).length || 0;
  const remadeCount = barReturns?.filter((d) => d.status === BarReturnStatus.REMADE).length || 0;
  const resolvedCount = barReturns?.filter((d) => d.status === BarReturnStatus.RESOLVED).length || 0;
  const refundedCount = barReturns?.filter((d) => d.status === BarReturnStatus.REFUNDED).length || 0;

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
          <StatCard
            title="Pending"
            value={pendingCount.toString()}
            icon={Clock}
            iconColor="warning"
          />
          <StatCard
            title="Remade"
            value={remadeCount.toString()}
            icon={RefreshCw}
            iconColor="primary"
          />
          <StatCard
            title="Resolved"
            value={resolvedCount.toString()}
            icon={CheckCircle2}
            iconColor="success"
          />
          <StatCard
            title="Refunded"
            value={refundedCount.toString()}
            icon={XCircle}
            iconColor="destructive"
          />
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
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : isError ? (
              <div className="text-center text-destructive p-4 flex items-center justify-center gap-2">
                <AlertCircle className="h-5 w-5" />
                <span>Error loading returns: {error?.message || "Unknown error"}</span>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center text-muted-foreground p-4">
                No bar returns found.
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
                    const StatusIcon = statusIcons[item.status];
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
                          <Badge className={cn(statusStyles[item.status])}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {item.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{item.time}</TableCell>
                        <TableCell className="text-right">
                          {item.status === BarReturnStatus.PENDING ? (
                            <div className="flex gap-1 justify-end">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUpdateStatus(item.id, BarReturnStatus.REMADE, `Item remade for ${item.table}`)}
                                disabled={updateStatusMutation.isPending}
                              >
                                Remake
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleUpdateStatus(item.id, BarReturnStatus.RESOLVED, `Issue resolved for ${item.table}`)}
                                disabled={updateStatusMutation.isPending}
                              >
                                Resolve
                              </Button>
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
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
