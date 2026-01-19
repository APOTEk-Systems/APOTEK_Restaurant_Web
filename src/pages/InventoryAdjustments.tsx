import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, ArrowUp, ArrowDown, RefreshCw } from "lucide-react";

const adjustments = [
  {
    id: "ADJ-001",
    date: "2024-01-15",
    item: "Olive Oil",
    type: "increase",
    quantity: 10,
    reason: "New shipment received",
    adjustedBy: "John Doe",
  },
  {
    id: "ADJ-002",
    date: "2024-01-14",
    item: "Tomatoes",
    type: "decrease",
    quantity: 5,
    reason: "Spoilage",
    adjustedBy: "Jane Smith",
  },
  {
    id: "ADJ-003",
    date: "2024-01-13",
    item: "Chicken Breast",
    type: "correction",
    quantity: 3,
    reason: "Physical count discrepancy",
    adjustedBy: "Mike Johnson",
  },
  {
    id: "ADJ-004",
    date: "2024-01-12",
    item: "Flour",
    type: "increase",
    quantity: 25,
    reason: "Restock from supplier",
    adjustedBy: "John Doe",
  },
  {
    id: "ADJ-005",
    date: "2024-01-11",
    item: "Fresh Salmon",
    type: "decrease",
    quantity: 2,
    reason: "Quality issue - returned to supplier",
    adjustedBy: "Jane Smith",
  },
];

const typeStyles = {
  increase: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  decrease: "bg-red-500/10 text-red-500 border-red-500/20",
  correction: "bg-amber-500/10 text-amber-500 border-amber-500/20",
};

const typeIcons = {
  increase: ArrowUp,
  decrease: ArrowDown,
  correction: RefreshCw,
};

const InventoryAdjustments = () => {
  return (
    <MainLayout title="Inventory Adjustments" subtitle="Track and manage stock level changes">
      <div className="space-y-6">
        {/* Action Button */}
        <div className="flex justify-end">
          <Button className="gradient-primary shadow-glow">
            <Plus className="h-4 w-4 mr-2" />
            New Adjustment
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Today's Adjustments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">5</div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Increases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-500">+35 units</div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Decreases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">-7 units</div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search adjustments..." className="pl-9 glass-card" />
          </div>
        </div>

        {/* Adjustments List */}
        <Card className="glass-card">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">ID</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Date</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Item</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Type</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Quantity</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Reason</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Adjusted By</th>
                  </tr>
                </thead>
                <tbody>
                  {adjustments.map((adjustment) => {
                    const TypeIcon = typeIcons[adjustment.type as keyof typeof typeIcons];
                    return (
                      <tr key={adjustment.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="p-4 text-sm font-medium text-foreground">{adjustment.id}</td>
                        <td className="p-4 text-sm text-muted-foreground">{adjustment.date}</td>
                        <td className="p-4 text-sm text-foreground">{adjustment.item}</td>
                        <td className="p-4">
                          <Badge className={typeStyles[adjustment.type as keyof typeof typeStyles]}>
                            <TypeIcon className="h-3 w-3 mr-1" />
                            {adjustment.type}
                          </Badge>
                        </td>
                        <td className="p-4 text-sm font-medium">
                          <span className={adjustment.type === "decrease" ? "text-red-500" : "text-emerald-500"}>
                            {adjustment.type === "decrease" ? "-" : "+"}{adjustment.quantity}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">{adjustment.reason}</td>
                        <td className="p-4 text-sm text-muted-foreground">{adjustment.adjustedBy}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default InventoryAdjustments;
