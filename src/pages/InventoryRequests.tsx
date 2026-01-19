import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Check, X, Clock, Flame, Wine } from "lucide-react";

const requests = [
  {
    id: "REQ-001",
    date: "2024-01-15 10:30",
    source: "kitchen",
    item: "Fresh Salmon",
    quantity: 5,
    unit: "kg",
    requestedBy: "Chef Marco",
    status: "pending",
    notes: "Needed for tonight's dinner service",
  },
  {
    id: "REQ-002",
    date: "2024-01-15 09:45",
    source: "bar",
    item: "Premium Vodka",
    quantity: 3,
    unit: "bottles",
    requestedBy: "Bartender Lisa",
    status: "approved",
    notes: "Running low for weekend rush",
  },
  {
    id: "REQ-003",
    date: "2024-01-15 08:15",
    source: "kitchen",
    item: "Olive Oil",
    quantity: 2,
    unit: "liters",
    requestedBy: "Sous Chef Anna",
    status: "fulfilled",
    notes: "Regular restock",
  },
  {
    id: "REQ-004",
    date: "2024-01-14 16:00",
    source: "bar",
    item: "Lime Juice",
    quantity: 10,
    unit: "bottles",
    requestedBy: "Bartender Mike",
    status: "rejected",
    notes: "Excess request - already have sufficient stock",
  },
  {
    id: "REQ-005",
    date: "2024-01-14 14:30",
    source: "kitchen",
    item: "Chicken Breast",
    quantity: 15,
    unit: "kg",
    requestedBy: "Chef Marco",
    status: "pending",
    notes: "Catering event on Saturday",
  },
];

const statusStyles = {
  pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  approved: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  fulfilled: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  rejected: "bg-red-500/10 text-red-500 border-red-500/20",
};

const sourceStyles = {
  kitchen: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  bar: "bg-purple-500/10 text-purple-500 border-purple-500/20",
};

const InventoryRequests = () => {
  return (
    <MainLayout title="Inventory Requests" subtitle="Manage stock requests from kitchen and bar">
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-500">2</div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Flame className="h-4 w-4" />
                Kitchen Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">3</div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Wine className="h-4 w-4" />
                Bar Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-500">2</div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Check className="h-4 w-4" />
                Fulfilled Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-500">1</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search requests..." className="pl-9 glass-card" />
          </div>
        </div>

        {/* Requests List */}
        <Card className="glass-card">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">ID</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Date</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Source</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Item</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Quantity</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Requested By</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr key={request.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="p-4 text-sm font-medium text-foreground">{request.id}</td>
                      <td className="p-4 text-sm text-muted-foreground">{request.date}</td>
                      <td className="p-4">
                        <Badge className={sourceStyles[request.source as keyof typeof sourceStyles]}>
                          {request.source === "kitchen" ? <Flame className="h-3 w-3 mr-1" /> : <Wine className="h-3 w-3 mr-1" />}
                          {request.source}
                        </Badge>
                      </td>
                      <td className="p-4 text-sm text-foreground">{request.item}</td>
                      <td className="p-4 text-sm text-foreground">{request.quantity} {request.unit}</td>
                      <td className="p-4 text-sm text-muted-foreground">{request.requestedBy}</td>
                      <td className="p-4">
                        <Badge className={statusStyles[request.status as keyof typeof statusStyles]}>
                          {request.status}
                        </Badge>
                      </td>
                      <td className="p-4">
                        {request.status === "pending" && (
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-emerald-500 hover:bg-emerald-500/10">
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-500 hover:bg-red-500/10">
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default InventoryRequests;
