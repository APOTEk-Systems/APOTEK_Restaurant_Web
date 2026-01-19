import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";

const units = [
  { id: 1, name: "Kilogram", abbreviation: "kg", category: "Weight", baseUnit: true, conversionFactor: 1, active: true },
  { id: 2, name: "Gram", abbreviation: "g", category: "Weight", baseUnit: false, conversionFactor: 0.001, active: true },
  { id: 3, name: "Pound", abbreviation: "lb", category: "Weight", baseUnit: false, conversionFactor: 0.453592, active: true },
  { id: 4, name: "Ounce", abbreviation: "oz", category: "Weight", baseUnit: false, conversionFactor: 0.0283495, active: true },
  { id: 5, name: "Liter", abbreviation: "L", category: "Volume", baseUnit: true, conversionFactor: 1, active: true },
  { id: 6, name: "Milliliter", abbreviation: "mL", category: "Volume", baseUnit: false, conversionFactor: 0.001, active: true },
  { id: 7, name: "Gallon", abbreviation: "gal", category: "Volume", baseUnit: false, conversionFactor: 3.78541, active: true },
  { id: 8, name: "Piece", abbreviation: "pc", category: "Count", baseUnit: true, conversionFactor: 1, active: true },
  { id: 9, name: "Dozen", abbreviation: "dz", category: "Count", baseUnit: false, conversionFactor: 12, active: true },
  { id: 10, name: "Box", abbreviation: "box", category: "Package", baseUnit: true, conversionFactor: 1, active: true },
  { id: 11, name: "Case", abbreviation: "case", category: "Package", baseUnit: false, conversionFactor: 1, active: true },
  { id: 12, name: "Bottle", abbreviation: "btl", category: "Container", baseUnit: true, conversionFactor: 1, active: false },
];

const SettingsUnits = () => {
  return (
    <MainLayout 
      title="Units of Measurement" 
      subtitle="Manage units used for inventory and recipes"
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-muted-foreground">
              Define measurement units for inventory items, recipes, and purchasing.
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Unit
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Units of Measurement</CardTitle>
            <CardDescription>All measurement units available in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Unit Name</TableHead>
                  <TableHead>Abbreviation</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Base Unit</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {units.map((unit) => (
                  <TableRow key={unit.id}>
                    <TableCell className="font-medium">{unit.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{unit.abbreviation}</Badge>
                    </TableCell>
                    <TableCell>{unit.category}</TableCell>
                    <TableCell>
                      {unit.baseUnit ? (
                        <Badge>Base</Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={unit.active ? "default" : "secondary"}>
                        {unit.active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" disabled={unit.baseUnit}>
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

export default SettingsUnits;
