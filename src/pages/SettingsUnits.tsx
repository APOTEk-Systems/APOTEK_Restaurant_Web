import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { inventoryUnitService, InventoryUnit } from "@/services/inventoryUnitService";
import { toast } from "sonner";

const SettingsUnits = () => {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const { data: units = [], isLoading: isLoadingUnits } = useQuery({
    queryKey: ['inventory-units'],
    queryFn: () => inventoryUnitService.getAll(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => inventoryUnitService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-units'] });
      toast.success('Unit deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete unit');
    },
  });

  const getCategory = (type: string): string => {
    const typeLower = type.toLowerCase();
    if (['kilogram', 'gram', 'pound', 'ounce'].some(u => typeLower.includes(u))) return 'Weight';
    if (['liter', 'milliliter', 'gallon'].some(u => typeLower.includes(u))) return 'Volume';
    if (['piece', 'dozen'].some(u => typeLower.includes(u))) return 'Count';
    if (['box', 'case'].some(u => typeLower.includes(u))) return 'Package';
    if (['bottle'].some(u => typeLower.includes(u))) return 'Container';
    return type;
  };

  if (isLoadingUnits) {
    return (
      <MainLayout 
        title="Units of Measurement" 
        subtitle="Loading..."
      >
        <div className="flex items-center justify-center h-64">
          <p>Loading units...</p>
        </div>
      </MainLayout>
    );
  }

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
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {units.map((unit) => (
                  <TableRow key={unit.id}>
                    <TableCell className="font-medium">{unit.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{unit.symbol || '-'}</Badge>
                    </TableCell>
                    <TableCell>{getCategory(unit.name)}</TableCell>
                    <TableCell>
                      <Badge variant={unit.isActive ? "default" : "secondary"}>
                        {unit.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this unit?')) {
                              deleteMutation.mutate(unit.id);
                            }
                          }}
                        >
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
