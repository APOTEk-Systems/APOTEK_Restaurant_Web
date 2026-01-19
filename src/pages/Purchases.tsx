import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Eye, MoreHorizontal, Truck, Package, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

const purchases = [
  { id: "PO-001", supplier: "Fresh Farms Co.", items: 12, total: 2450.00 * 2400, date: "Jan 8, 2026", delivery: "Jan 10, 2026", status: "delivered" },
  { id: "PO-002", supplier: "Premium Meats Inc.", items: 8, total: 3780.00 * 2400, date: "Jan 7, 2026", delivery: "Jan 9, 2026", status: "in-transit" },
  { id: "PO-003", supplier: "Seafood Direct", items: 6, total: 1890.00 * 2400, date: "Jan 6, 2026", delivery: "Jan 8, 2026", status: "pending" },
  { id: "PO-004", supplier: "Wine & Spirits Dist.", items: 24, total: 4560.00 * 2400, date: "Jan 5, 2026", delivery: "Jan 7, 2026", status: "delivered" },
  { id: "PO-005", supplier: "Dairy Fresh", items: 15, total: 890.00 * 2400, date: "Jan 4, 2026", delivery: "Jan 6, 2026", status: "delivered" },
];

const statusStyles = {
  pending: "bg-warning/10 text-warning border-warning/20",
  "in-transit": "bg-primary/10 text-primary border-primary/20",
  delivered: "bg-success/10 text-success border-success/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

const statusIcons = {
  pending: FileText,
  "in-transit": Truck,
  delivered: Package,
  cancelled: FileText,
};

export default function Purchases() {
  return (
    <MainLayout title="Purchases" subtitle="Manage supplier orders and deliveries">
      <div className="space-y-6 animate-fade-in">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
            <p className="text-sm text-muted-foreground">Total Orders</p>
            <p className="text-2xl font-bold text-foreground mt-1">48</p>
            <p className="text-xs text-success mt-1">This month</p>
          </div>
          <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold text-warning mt-1">5</p>
            <p className="text-xs text-muted-foreground mt-1">Awaiting approval</p>
          </div>
          <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
            <p className="text-sm text-muted-foreground">In Transit</p>
            <p className="text-2xl font-bold text-primary mt-1">3</p>
            <p className="text-xs text-muted-foreground mt-1">On the way</p>
          </div>
          <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
            <p className="text-sm text-muted-foreground">Total Spent</p>
            <p className="text-2xl font-bold text-foreground mt-1">{(45890 * 2400).toLocaleString('en-US', )}</p>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-3">
            <div className="relative flex-1 sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search purchases..." className="pl-9" />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-transit">In Transit</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Link to="/purchases/new">
            <Button className="gradient-primary text-primary-foreground shadow-glow hover:shadow-lg transition-shadow">
              <Plus className="h-4 w-4 mr-2" />
              New Purchase Order
            </Button>
          </Link>
        </div>

        {/* Purchases Table */}
        <div className="bg-card rounded-xl shadow-card border border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Order ID</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Supplier</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Items</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Order Date</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Total</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {purchases.map((purchase) => {
                  const StatusIcon = statusIcons[purchase.status as keyof typeof statusIcons];
                  return (
                    <tr key={purchase.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">{purchase.id}</td>
                      <td className="px-6 py-4 text-foreground">{purchase.supplier}</td>
                      <td className="px-6 py-4 text-foreground">{purchase.items} items</td>
                      <td className="px-6 py-4 text-muted-foreground">{purchase.date}</td>
                      <td className="px-6 py-4">
                        <Badge className={cn("capitalize", statusStyles[purchase.status as keyof typeof statusStyles])}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {purchase.status.replace("-", " ")}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 font-semibold text-foreground">{purchase.total.toLocaleString('en-US', )}</td>
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
