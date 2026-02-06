import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { inventoryUnitService, InventoryUnit } from "@/services/inventoryUnitService";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const SettingsUnits = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<InventoryUnit | null>(null);
  const [formData, setFormData] = useState({ name: "", symbol: "", type: "" });

  const { data: units = [], isLoading: isLoadingUnits } = useQuery({
    queryKey: ['inventory-units'],
    queryFn: () => inventoryUnitService.getAll(),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: { name: string; symbol: string; type: string }) => inventoryUnitService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-units'] });
      toast.success('Unit created successfully');
      setIsDialogOpen(false);
      setFormData({ name: "", symbol: "", type: "" });
    },
    onError: () => {
      toast.error('Failed to create unit');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name: string; symbol: string; type: string } }) =>
      inventoryUnitService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-units'] });
      toast.success('Unit updated successfully');
      setIsDialogOpen(false);
      setEditingUnit(null);
      setFormData({ name: "", symbol: "", type: "" });
    },
    onError: () => {
      toast.error('Failed to update unit');
    },
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUnit) {
      updateMutation.mutate({ id: editingUnit.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (unit: InventoryUnit) => {
    setEditingUnit(unit);
    setFormData({ name: unit.name, symbol: unit.symbol || "", type: unit.type || "" });
    setIsDialogOpen(true);
  };

  if (isLoadingUnits) {
    return (
      <MainLayout
        title="Units of Measurement"
        subtitle="Loading..."
      >
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Loading units...</span>
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
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingUnit(null); setFormData({ name: "", symbol: "", type: "" }); }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Unit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingUnit ? "Edit Unit" : "Add New Unit"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Unit Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Kilogram, Liter, Piece"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="symbol">Abbreviation</Label>
                  <Input
                    id="symbol"
                    value={formData.symbol}
                    onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                    placeholder="e.g., kg, L, pc"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Input
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    placeholder="e.g., Weight, Volume, Count"
                    required
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {createMutation.isPending || updateMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save"
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
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
                  <TableHead>Type</TableHead>
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
                    <TableCell>{unit.type || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={unit.isActive ? "default" : "secondary"}>
                        {unit.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(unit)}>
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
