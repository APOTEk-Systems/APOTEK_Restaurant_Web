import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Package, AlertTriangle, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { InventoryService, type InventoryCategory, type InventoryUnit, type CreateInventoryItemData } from "@/services/inventoryService";
import { SupplierService, type Supplier } from "@/services/supplierService";
import { useToast } from "@/hooks/use-toast";

const inventoryLocations = [
  { value: "KITCHEN", label: "Kitchen" },
  { value: "BAR", label: "Bar" },
  { value: "STORAGE", label: "Storage" },
  { value: "WALKIN_COOLER", label: "Walk-in Cooler" },
  { value: "FREEZER", label: "Freezer" },
  { value: "DRY_STORAGE", label: "Dry Storage" },
];

const departments = [
  { value: "KITCHEN", label: "Kitchen" },
  { value: "BAR", label: "Bar" },
  { value: "SERVICE", label: "Service" },
  { value: "OPERATIONS", label: "Operations" },
  { value: "MANAGEMENT", label: "Management" },
];

export default function InventoryNew() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    description: "",
    categoryId: "",
    unit: "",
    supplier: "",
    quantity: 0,
    minStock: 0,
    maxStock: 0,
    price: 0,
    location: "",
    storageLocation: "",
    trackExpiry: false,
    departments: ["KITCHEN"] as string[],
  });

  // Fetch categories
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery<InventoryCategory[], Error>({
    queryKey: ['inventoryCategories'],
    queryFn: InventoryService.getAllCategories,
  });

  // Fetch units
  const { data: units = [], isLoading: isLoadingUnits } = useQuery<InventoryUnit[], Error>({
    queryKey: ['inventoryUnits'],
    queryFn: InventoryService.getAllUnits,
  });

  // Fetch suppliers
  const { data: suppliers = [], isLoading: isLoadingSuppliers } = useQuery<Supplier[], Error>({
    queryKey: ['suppliers'],
    queryFn: SupplierService.getAllSuppliers,
  });

  const isLoading = isLoadingCategories || isLoadingUnits || isLoadingSuppliers;

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateInventoryItemData) =>
      InventoryService.createItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventoryItems'] });
      toast({
        title: "Success",
        description: "Inventory item created successfully",
      });
      // Redirect to inventory page
      setTimeout(() => {
        window.location.href = "/inventory";
      }, 1000);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create inventory item",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDepartmentChange = (deptValue: string, checked: boolean) => {
    setFormData(prev => {
      if (checked) {
        return { ...prev, departments: [...prev.departments, deptValue] };
      } else {
        return { ...prev, departments: prev.departments.filter(d => d !== deptValue) };
      }
    });
  };

  // Check if form is valid for button state
  const isFormValid = useMemo(() => {
    return (
      formData.name.trim() !== "" &&
      formData.categoryId !== "" &&
      formData.unit !== "" &&
      formData.price !== null &&
      formData.price !== undefined &&
      formData.price > 0
    );
  }, [formData.name, formData.categoryId, formData.unit, formData.price]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter an item name",
        variant: "destructive",
      });
      return;
    }

    if (!formData.categoryId) {
      toast({
        title: "Validation Error",
        description: "Please select a category",
        variant: "destructive",
      });
      return;
    }

    if (!formData.unit) {
      toast({
        title: "Validation Error",
        description: "Please select a unit",
        variant: "destructive",
      });
      return;
    }

    if (formData.price === null || formData.price === undefined || formData.price <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid price greater than 0",
        variant: "destructive",
      });
      return;
    }

    // Prepare data for API
    const data = {
      name: formData.name,
      description: formData.description || undefined,
      sku: formData.sku || undefined,
      categoryId: parseInt(formData.categoryId),
      unit: formData.unit,
      department: formData.departments,
      quantity: formData.quantity,
      minStock: formData.minStock || undefined,
      maxStock: formData.maxStock || undefined,
      price: formData.price,
      supplier: formData.supplier || undefined,
      location: formData.location || undefined,
      storageLocation: formData.storageLocation || undefined,
    };

    createMutation.mutate(data);
  };

  return (
    <MainLayout title="Add New Item" subtitle="Add a new item to your inventory">
      <div className="space-y-6 animate-fade-in max-w-3xl">
        {/* Back Button */}
        <Link to="/inventory">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Current Stock
          </Button>
        </Link>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Loading form data...</span>
          </div>
        ) : (
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
                      onChange={(e) => handleInputChange("name", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU / Item Code</Label>
                    <Input
                      id="sku"
                      placeholder="e.g., INV-001"
                      value={formData.sku}
                      onChange={(e) => handleInputChange("sku", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.categoryId}
                      onValueChange={(value) => handleInputChange("categoryId", value)}
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat.id} value={String(cat.id)}>
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
                      onValueChange={(value) => handleInputChange("supplier", value)}
                    >
                      <SelectTrigger id="supplier">
                        <SelectValue placeholder="Select supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map(supplier => (
                          <SelectItem key={supplier.id} value={supplier.name}>
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
                    onChange={(e) => handleInputChange("description", e.target.value)}
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
                    <Label htmlFor="quantity">Current Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={formData.quantity || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        handleInputChange("quantity", val === "" ? 0 : parseFloat(val) || 0);
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit *</Label>
                    <Select
                      value={formData.unit}
                      onValueChange={(value) => handleInputChange("unit", value)}
                    >
                      <SelectTrigger id="unit">
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {units.map(unit => (
                          <SelectItem key={unit.id} value={unit.name}>
                            {unit.name} {unit.symbol ? `(${unit.symbol})` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Unit Price (TZS) *</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.price || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        handleInputChange("price", val === "" ? 0 : parseFloat(val) || 0);
                      }}
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
                      value={formData.minStock || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        handleInputChange("minStock", val === "" ? 0 : parseFloat(val) || 0);
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxStock">Maximum Stock Level</Label>
                    <Input
                      id="maxStock"
                      type="number"
                      min="0"
                      placeholder="Maximum capacity"
                      value={formData.maxStock || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        handleInputChange("maxStock", val === "" ? 0 : parseFloat(val) || 0);
                      }}
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
                {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Storage Location</Label>
                    <Select
                      value={formData.location}
                      onValueChange={(value) => handleInputChange("location", value)}
                    >
                      <SelectTrigger id="location">
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        {inventoryLocations.map(loc => (
                          <SelectItem key={loc.value} value={loc.value}>
                            {loc.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="storageLocation">Specific Location</Label>
                    <Input
                      id="storageLocation"
                      placeholder="e.g., Walk-in Cooler A"
                      value={formData.storageLocation}
                      onChange={(e) => handleInputChange("storageLocation", e.target.value)}
                    />
                  </div>
                </div> */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Departments</Label>
                  <p className="text-xs text-muted-foreground">Select one or more departments this item belongs to</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
                    {departments.map((dept) => (
                      <div key={dept.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`dept-${dept.value}`}
                          checked={formData.departments.includes(dept.value)}
                          onCheckedChange={(checked) => handleDepartmentChange(dept.value, checked as boolean)}
                        />
                        <Label
                          htmlFor={`dept-${dept.value}`}
                          className="text-sm cursor-pointer"
                        >
                          {dept.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                {/* <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                  <div>
                    <Label htmlFor="trackExpiry" className="font-medium">Track Expiry Dates</Label>
                    <p className="text-sm text-muted-foreground">Get alerts before items expire</p>
                  </div>
                  <Switch
                    id="trackExpiry"
                    checked={formData.trackExpiry}
                    onCheckedChange={(checked) => handleInputChange("trackExpiry", checked)}
                  />
                </div> */}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-3 justify-end">
              <Link to="/inventory">
                <Button variant="outline">Cancel</Button>
              </Link>
              <Button
                type="submit"
                className="gradient-primary text-primary-foreground shadow-glow hover:shadow-lg transition-shadow"
                disabled={createMutation.isPending || !isFormValid}
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Package className="h-4 w-4 mr-2" />
                    Add Item
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </MainLayout>
  );
}
