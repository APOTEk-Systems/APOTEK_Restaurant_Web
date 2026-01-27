import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Package, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { InventoryService, Supplier } from "@/services/inventoryService";

export default function InventoryNew() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    description: "",
    categoryId: "",
    unit: "",
    quantity: "",
    minStock: "",
    maxStock: "",
    price: "",
    supplier: "",
    storageLocation: "",
  });

  // Fetch categories
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['inventoryCategories'],
    queryFn: InventoryService.getAllInventoryCategories,
  });

  // Fetch units
  const { data: units = [], isLoading: unitsLoading } = useQuery({
    queryKey: ['inventoryUnits'],
    queryFn: InventoryService.getAllInventoryUnits,
  });

  // Fetch suppliers
  const { data: suppliers = [], isLoading: suppliersLoading } = useQuery<Supplier[]>({
    queryKey: ['suppliers'],
    queryFn: InventoryService.getAllSuppliers,
  });

  // Create inventory item mutation
  const createMutation = useMutation({
    mutationFn: InventoryService.createInventoryItem,
    onSuccess: () => {
      navigate("/inventory");
    },
    onError: (error: any) => {
      console.error("Error creating inventory item:", error);
      alert(error.response?.data?.message || "Failed to create inventory item");
    },
  });

  const isLoading = categoriesLoading || unitsLoading || suppliersLoading;

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.categoryId || !formData.unit || !formData.quantity || !formData.price) {
      alert("Please fill in all required fields");
      return;
    }

    const data = {
      name: formData.name,
      description: formData.description || undefined,
      sku: formData.sku || undefined,
      categoryId: parseInt(formData.categoryId),
      unit: formData.unit,
      quantity: parseFloat(formData.quantity),
      minStock: formData.minStock ? parseFloat(formData.minStock) : undefined,
      maxStock: formData.maxStock ? parseFloat(formData.maxStock) : undefined,
      price: parseFloat(formData.price),
      supplier: formData.supplier || undefined,
      storageLocation: formData.storageLocation || undefined,
    };

    createMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <MainLayout title="Add Inventory Item" subtitle="Add a new item to your inventory">
        <div className="space-y-6 animate-fade-in max-w-3xl">
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Add Inventory Item" subtitle="Add a new item to your inventory">
      <div className="space-y-6 animate-fade-in max-w-3xl">
        {/* Back Button */}
        <Link to="/inventory">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Inventory
          </Button>
        </Link>

        <form onSubmit={handleSubmit} className="grid gap-6">
          {/* Basic Information */}
          <Card className="shadow-card border-border/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Item Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Fresh Salmon"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU / Item Code</Label>
                  <Input
                    id="sku"
                    placeholder="e.g., INV-001"
                    value={formData.sku}
                    onChange={(e) => handleChange("sku", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(value) => handleChange("categoryId", value)}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat: { id: number; name: string }) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supplier">Preferred Supplier</Label>
                  <Select
                    value={formData.supplier}
                    onValueChange={(value) => handleChange("supplier", value)}
                  >
                    <SelectTrigger id="supplier">
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((supplier: { id: number; name: string }) => (
                        <SelectItem key={supplier.id} value={supplier.id.toString()}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Item description, specifications, etc."
                  rows={3}
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Stock & Pricing */}
          <Card className="shadow-card border-border/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                Stock & Pricing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Current Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.quantity}
                    onChange={(e) => handleChange("quantity", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit *</Label>
                  <Select
                    value={formData.unit}
                    onValueChange={(value) => handleChange("unit", value)}
                  >
                    <SelectTrigger id="unit">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map((unit: { id: number; name: string; symbol: string | null }) => (
                        <SelectItem key={unit.id} value={unit.name}>
                          {unit.name} ({unit.symbol || "N/A"})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Unit Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={(e) => handleChange("price", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minStock">Minimum Stock Level</Label>
                  <Input
                    id="minStock"
                    type="number"
                    min="0"
                    placeholder="Alert when below this"
                    value={formData.minStock}
                    onChange={(e) => handleChange("minStock", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxStock">Maximum Stock Level</Label>
                  <Input
                    id="maxStock"
                    type="number"
                    min="0"
                    placeholder="Maximum capacity"
                    value={formData.maxStock}
                    onChange={(e) => handleChange("maxStock", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Settings */}
          <Card className="shadow-card border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Additional Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="storageLocation">Storage Location</Label>
                  <Input
                    id="storageLocation"
                    placeholder="e.g., Walk-in Cooler A, Shelf 3"
                    value={formData.storageLocation}
                    onChange={(e) => handleChange("storageLocation", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Link to="/inventory">
              <Button variant="outline" type="button">Cancel</Button>
            </Link>
            <Button
              type="submit"
              className="gradient-primary text-primary-foreground shadow-glow hover:shadow-lg transition-shadow"
              disabled={createMutation.isPending}
            >
              <Package className="h-4 w-4 mr-2" />
              {createMutation.isPending ? "Creating..." : "Add Inventory Item"}
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
