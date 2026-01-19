import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";

const adjustmentReasons = [
  { id: 1, name: "Damaged Goods", type: "decrease", description: "Products damaged during storage or handling", active: true },
  { id: 2, name: "Theft/Loss", type: "decrease", description: "Unaccounted inventory loss", active: true },
  { id: 3, name: "Expired Products", type: "decrease", description: "Items past expiration date", active: true },
  { id: 4, name: "Inventory Recount", type: "both", description: "Adjustment after physical count", active: true },
  { id: 5, name: "Supplier Return", type: "decrease", description: "Items returned to supplier", active: true },
  { id: 6, name: "Promotional Giveaway", type: "decrease", description: "Items given for promotions", active: true },
  { id: 7, name: "Found Stock", type: "increase", description: "Previously unrecorded inventory found", active: true },
  { id: 8, name: "Transfer In", type: "increase", description: "Stock transferred from another location", active: false },
];

const SettingsAdjustmentReasons = () => {
  return (
    <MainLayout 
      title="Adjustment Reasons" 
      subtitle="Manage reasons for inventory adjustments"
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-muted-foreground">
              Define reasons that can be selected when making inventory adjustments.
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Reason
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Adjustment Reasons</CardTitle>
            <CardDescription>List of available adjustment reasons for inventory management</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reason Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adjustmentReasons.map((reason) => (
                  <TableRow key={reason.id}>
                    <TableCell className="font-medium">{reason.name}</TableCell>
                    <TableCell>
                      <Badge variant={reason.type === "increase" ? "default" : reason.type === "decrease" ? "destructive" : "secondary"}>
                        {reason.type === "both" ? "Increase/Decrease" : reason.type.charAt(0).toUpperCase() + reason.type.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{reason.description}</TableCell>
                    <TableCell>
                      <Badge variant={reason.active ? "outline" : "secondary"}>
                        {reason.active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default SettingsAdjustmentReasons;
