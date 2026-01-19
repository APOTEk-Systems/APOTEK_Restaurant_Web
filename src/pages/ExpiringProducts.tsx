import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, Search, AlertTriangle, Clock, Trash2, Package } from "lucide-react";
import { cn } from "@/lib/utils";

const expiringProducts = [
  {
    id: "BATCH-001",
    item: "Fresh Salmon",
    batchNumber: "SAL-2024-0115",
    quantity: 8,
    unit: "kg",
    receivedDate: "2024-01-12",
    expiryDate: "2024-01-17",
    daysLeft: 2,
    location: "Walk-in Cooler A",
    status: "critical",
  },
  {
    id: "BATCH-002",
    item: "Heavy Cream",
    batchNumber: "CRM-2024-0110",
    quantity: 5,
    unit: "liters",
    receivedDate: "2024-01-10",
    expiryDate: "2024-01-20",
    daysLeft: 5,
    location: "Refrigerator B",
    status: "warning",
  },
  {
    id: "BATCH-003",
    item: "Fresh Herbs Mix",
    batchNumber: "HRB-2024-0114",
    quantity: 2,
    unit: "kg",
    receivedDate: "2024-01-14",
    expiryDate: "2024-01-18",
    daysLeft: 3,
    location: "Walk-in Cooler A",
    status: "warning",
  },
  {
    id: "BATCH-004",
    item: "Mozzarella Cheese",
    batchNumber: "MOZ-2024-0108",
    quantity: 4,
    unit: "kg",
    receivedDate: "2024-01-08",
    expiryDate: "2024-01-22",
    daysLeft: 7,
    location: "Refrigerator A",
    status: "normal",
  },
  {
    id: "BATCH-005",
    item: "Greek Yogurt",
    batchNumber: "YOG-2024-0112",
    quantity: 10,
    unit: "units",
    receivedDate: "2024-01-12",
    expiryDate: "2024-01-26",
    daysLeft: 11,
    location: "Refrigerator B",
    status: "normal",
  },
  {
    id: "BATCH-006",
    item: "Shrimp",
    batchNumber: "SHP-2024-0114",
    quantity: 3,
    unit: "kg",
    receivedDate: "2024-01-14",
    expiryDate: "2024-01-16",
    daysLeft: 1,
    location: "Walk-in Freezer",
    status: "critical",
  },
];

const statusStyles = {
  critical: "bg-red-500/10 text-red-500 border-red-500/20",
  warning: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  normal: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
};

const getProgressColor = (daysLeft: number) => {
  if (daysLeft <= 2) return "bg-red-500";
  if (daysLeft <= 5) return "bg-amber-500";
  return "bg-emerald-500";
};

const ExpiringProducts = () => {
  const criticalCount = expiringProducts.filter(p => p.status === "critical").length;
  const warningCount = expiringProducts.filter(p => p.status === "warning").length;

  return (
    <MainLayout title="Expiring Products" subtitle="Manage inventory batches and expiration dates">
      <div className="space-y-6">
        {/* Action Button */}
        <div className="flex justify-end">
          <Button className="gradient-primary shadow-glow">
            <Plus className="h-4 w-4 mr-2" />
            Add Batch
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="glass-card border-red-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                Critical (≤2 days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{criticalCount}</div>
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
              <div className="text-2xl font-bold text-amber-500">{warningCount}</div>
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
              <div className="text-2xl font-bold text-foreground">{expiringProducts.length}</div>
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
              <div className="text-2xl font-bold text-muted-foreground">3</div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search batches..." className="pl-9 glass-card" />
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {expiringProducts.map((product) => (
            <Card key={product.id} className="glass-card hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold text-foreground">{product.item}</CardTitle>
                    <p className="text-sm text-muted-foreground">{product.batchNumber}</p>
                  </div>
                  <Badge className={statusStyles[product.status as keyof typeof statusStyles]}>
                    {product.status === "critical" && <AlertTriangle className="h-3 w-3 mr-1" />}
                    {product.daysLeft} days left
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Time until expiry</span>
                    <span className="text-foreground font-medium">{product.daysLeft} days</span>
                  </div>
                  <Progress 
                    value={Math.max(0, Math.min(100, (14 - product.daysLeft) / 14 * 100))} 
                    className={cn("h-2", getProgressColor(product.daysLeft))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Quantity</p>
                    <p className="font-medium text-foreground">{product.quantity} {product.unit}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Location</p>
                    <p className="font-medium text-foreground">{product.location}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Received</p>
                    <p className="font-medium text-foreground">{product.receivedDate}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Expires</p>
                    <p className="font-medium text-foreground">{product.expiryDate}</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    Use Stock
                  </Button>
                  <Button size="sm" variant="ghost" className="text-red-500 hover:bg-red-500/10">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default ExpiringProducts;
