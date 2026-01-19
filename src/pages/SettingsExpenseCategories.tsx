import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";

const expenseCategories = [
  { id: 1, name: "Food & Ingredients", code: "FOOD", description: "Raw materials and ingredients for kitchen", active: true },
  { id: 2, name: "Beverages", code: "BEV", description: "Drinks and beverage supplies", active: true },
  { id: 3, name: "Utilities", code: "UTIL", description: "Electricity, water, gas, and internet", active: true },
  { id: 4, name: "Rent & Lease", code: "RENT", description: "Property rental and lease payments", active: true },
  { id: 5, name: "Salaries & Wages", code: "SAL", description: "Staff compensation and benefits", active: true },
  { id: 6, name: "Equipment", code: "EQUIP", description: "Kitchen and restaurant equipment", active: true },
  { id: 7, name: "Maintenance", code: "MAINT", description: "Repairs and maintenance costs", active: true },
  { id: 8, name: "Marketing", code: "MKT", description: "Advertising and promotional expenses", active: true },
  { id: 9, name: "Cleaning Supplies", code: "CLEAN", description: "Cleaning materials and sanitation", active: true },
  { id: 10, name: "Insurance", code: "INS", description: "Business insurance premiums", active: false },
];

const SettingsExpenseCategories = () => {
  return (
    <MainLayout 
      title="Expense Categories" 
      subtitle="Manage expense categories for financial tracking"
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-muted-foreground">
              Define categories to organize and track your restaurant expenses.
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Expense Categories</CardTitle>
            <CardDescription>Categories used for organizing expenses in accounting</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenseCategories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{category.code}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{category.description}</TableCell>
                    <TableCell>
                      <Badge variant={category.active ? "default" : "secondary"}>
                        {category.active ? "Active" : "Inactive"}
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

export default SettingsExpenseCategories;
