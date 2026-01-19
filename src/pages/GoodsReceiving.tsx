import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Eye, MoreHorizontal, CheckCircle2, Clock, AlertCircle, Package } from "lucide-react";
import { cn } from "@/lib/utils";

const receivings = [
  { id: "GR-001", poId: "PO-001", supplier: "Fresh Farms Co.", items: 12, receivedDate: "Jan 10, 2026", receivedBy: "John Doe", status: "complete" },
  { id: "GR-002", poId: "PO-002", supplier: "Premium Meats Inc.", items: 8, receivedDate: "Jan 9, 2026", receivedBy: "Jane Smith", status: "partial" },
  { id: "GR-003", poId: "PO-004", supplier: "Wine & Spirits Dist.", items: 24, receivedDate: "Jan 7, 2026", receivedBy: "John Doe", status: "complete" },
  { id: "GR-004", poId: "PO-005", supplier: "Dairy Fresh", items: 15, receivedDate: "Jan 6, 2026", receivedBy: "Mike Wilson", status: "complete" },
  { id: "GR-005", poId: "PO-003", supplier: "Seafood Direct", items: 6, receivedDate: "-", receivedBy: "-", status: "pending" },
];

const statusStyles = {
  pending: "bg-warning/10 text-warning border-warning/20",
  partial: "bg-primary/10 text-primary border-primary/20",
  complete: "bg-success/10 text-success border-success/20",
  issue: "bg-destructive/10 text-destructive border-destructive/20",
};

const statusIcons = {
  pending: Clock,
  partial: Package,
  complete: CheckCircle2,
  issue: AlertCircle,
};

export default function GoodsReceiving() {
  return (
    <MainLayout title="Goods Receiving" subtitle="Track and manage incoming deliveries">
      <div className="space-y-6 animate-fade-in">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
            <p className="text-sm text-muted-foreground">Total Received</p>
            <p className="text-2xl font-bold text-foreground mt-1">156</p>
            <p className="text-xs text-success mt-1">This month</p>
          </div>
          <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold text-warning mt-1">3</p>
            <p className="text-xs text-muted-foreground mt-1">Awaiting delivery</p>
          </div>
          <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
            <p className="text-sm text-muted-foreground">Partial Deliveries</p>
            <p className="text-2xl font-bold text-primary mt-1">2</p>
            <p className="text-xs text-muted-foreground mt-1">Incomplete orders</p>
          </div>
          <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
            <p className="text-sm text-muted-foreground">Issues</p>
            <p className="text-2xl font-bold text-destructive mt-1">1</p>
            <p className="text-xs text-muted-foreground mt-1">Requires attention</p>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-3">
            <div className="relative flex-1 sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by PO or supplier..." className="pl-9" />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="complete">Complete</SelectItem>
                <SelectItem value="issue">Has Issues</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button className="gradient-primary text-primary-foreground shadow-glow hover:shadow-lg transition-shadow">
            <Plus className="h-4 w-4 mr-2" />
            Record Receiving
          </Button>
        </div>

        {/* Receiving Table */}
        <div className="bg-card rounded-xl shadow-card border border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Receiving ID</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">PO Reference</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Supplier</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Items</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Received Date</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Received By</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {receivings.map((receiving) => {
                  const StatusIcon = statusIcons[receiving.status as keyof typeof statusIcons];
                  return (
                    <tr key={receiving.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">{receiving.id}</td>
                      <td className="px-6 py-4 text-primary font-medium">{receiving.poId}</td>
                      <td className="px-6 py-4 text-foreground">{receiving.supplier}</td>
                      <td className="px-6 py-4 text-foreground">{receiving.items} items</td>
                      <td className="px-6 py-4 text-muted-foreground">{receiving.receivedDate}</td>
                      <td className="px-6 py-4 text-muted-foreground">{receiving.receivedBy}</td>
                      <td className="px-6 py-4">
                        <Badge className={cn("capitalize", statusStyles[receiving.status as keyof typeof statusStyles])}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {receiving.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
