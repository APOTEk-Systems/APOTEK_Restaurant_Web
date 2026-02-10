import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, Trash2, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SupplierService, Supplier } from "@/services/supplierService";
import {
  inventoryItemService,
  InventoryItem,
} from "@/services/inventoryItemService";
import {
  inventoryUnitService,
  type InventoryUnit,
} from "@/services/inventoryUnitService";
import { purchaseOrderService } from "@/services/purchaseOrderService";
import { toast } from "sonner";

interface ItemForm {
  id: number;
  itemId: string;
  quantity: number;
  unitPrice?: number;
}

export default function PurchaseOrderNew() {
  const [selectedSupplier, setSelectedSupplier] = useState<string>("");
  const [itemForms, setItemForms] = useState<ItemForm[]>([
    { id: Date.now(), itemId: "", quantity: 1, unitPrice: undefined },
  ]);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch suppliers using React Query
  const { data: suppliers = [], isLoading: isLoadingSuppliers } = useQuery({
    queryKey: ["suppliers"],
    queryFn: SupplierService.getAllSuppliers,
  });

  // Fetch inventory items using React Query
  const { data: inventoryItems = [], isLoading: isLoadingItems } = useQuery({
    queryKey: ["inventoryItems"],
    queryFn: inventoryItemService.getAllInventoryItems,
  });

  // Fetch inventory units for symbol lookup
  const { data: inventoryUnits = [] } = useQuery({
    queryKey: ["inventory-units"],
    queryFn: inventoryUnitService.getAll,
  });

  // Create a map of unit name (lowercase) to symbol for case-insensitive lookup
  const unitSymbolMap = useMemo(() => {
    const map: Record<string, string> = {};
    (inventoryUnits as InventoryUnit[]).forEach((unit) => {
      const key = unit.name.toLowerCase();
      map[key] = unit.symbol || unit.name;
    });
    return map;
  }, [inventoryUnits]);

  // Helper function to get unit symbol with contains matching
  const getUnitSymbol = (unitName: string): string => {
    if (!unitName) return "";

    const normalizedName = unitName.toLowerCase();

    // Try exact match first
    if (unitSymbolMap[normalizedName]) {
      return unitSymbolMap[normalizedName];
    }

    // Try contains match (e.g., "kilograms" contains "kilogram")
    for (const [key, value] of Object.entries(unitSymbolMap)) {
      if (normalizedName.includes(key) || key.includes(normalizedName)) {
        return value;
      }
    }

    return unitName;
  };

  const isLoading = isLoadingSuppliers || isLoadingItems;

  // Create purchase order mutation
  const createMutation = useMutation({
    mutationFn: (data: {
      poNumber?: string;
      supplierId: number;
      notes?: string;
      expectedDeliveryAt?: string;
      items: Array<{
        inventoryItemId: number;
        quantityOrdered: number;
        unitPrice: number;
      }>;
    }) => purchaseOrderService.createPurchaseOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchaseOrders"] });
      toast.success("Purchase order created successfully");
      navigate("/purchases");
    },
    onError: (error: any) => {
      console.error("Failed to create purchase order:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to create purchase order";
      toast.error(errorMessage);
    },
  });

  const updateForm = (
    id: number,
    field: "itemId" | "quantity" | "unitPrice",
    value: string | number
  ) => {
    setItemForms((forms) =>
      forms.map((form) => (form.id === id ? { ...form, [field]: value } : form))
    );
  };

  const addNewForm = () => {
    setItemForms([...itemForms, { id: Date.now(), itemId: "", quantity: 1, unitPrice: undefined }]);
  };

  const removeForm = (id: number) => {
    setItemForms((forms) => forms.filter((form) => form.id !== id));
  };

  const getItemDetails = (itemId: string) => {
    return inventoryItems.find(
      (item: InventoryItem) => item.id.toString() === itemId
    );
  };

  const getFormTotal = (form: ItemForm) => {
    const item = getItemDetails(form.itemId);
    const price = form.unitPrice !== undefined ? form.unitPrice : (item?.price || 0);
    return price * form.quantity;
  };

  const subtotal = itemForms.reduce((sum, form) => sum + getFormTotal(form), 0);
  const tax = subtotal * 0.1;
  const total = subtotal;

  const isFormValid =
    selectedSupplier && itemForms.some((f) => f.itemId && f.quantity > 0);

  const handleSubmit = () => {
    if (!selectedSupplier) return;

    const validItems = itemForms
      .filter((form) => form.itemId)
      .map((form) => {
        const item = getItemDetails(form.itemId);
        return {
          inventoryItemId: parseInt(form.itemId),
          quantityOrdered: form.quantity,
          unitPrice: form.unitPrice !== undefined ? form.unitPrice : (item?.price || 0),
        };
      });

    if (validItems.length === 0) {
      toast.error("Please add at least one item");
      return;
    }

    const supplierId = parseInt(selectedSupplier);

    createMutation.mutate({
      supplierId,
      items: validItems,
    });
  };

  return (
    <MainLayout
      title="Create Purchase Order"
      subtitle="Create a new purchase order for suppliers"
    >
      <div className="space-y-6 animate-fade-in">
        {/* Purchase Order Form */}
        <Card className="shadow-card border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Create Purchase Order</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Supplier Selection */}
            <div className="space-y-2">
              <Label htmlFor="supplier" className="text-sm font-medium">
                Supplier *
              </Label>
              <Select
                value={selectedSupplier}
                onValueChange={setSelectedSupplier}
              >
                <SelectTrigger id="supplier" className="w-full">
                  <SelectValue placeholder="Select a supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((supplier: Supplier) => (
                    <SelectItem
                      key={supplier.id}
                      value={supplier.id.toString()}
                    >
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Items Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Items *</Label>
              </div>

              {/* Stacked Item Forms */}
              {itemForms.map((form, index) => {
                const itemDetails = getItemDetails(form.itemId);

                return (
                  <div
                    key={form.id}
                    className="flex flex-col sm:flex-row gap-3 items-end border-b border-border/50 pb-4"
                  >
                    <div className="flex-1 space-y-2">
                      <Label className="xs text-muted-foreground">
                        Item {index + 1}
                      </Label>
                      <Select
                        value={form.itemId}
                        onValueChange={(value) => {
                          updateForm(form.id, "itemId", value);
                          // Reset unit price when item changes
                          const item = inventoryItems.find((i: InventoryItem) => i.id.toString() === value);
                          updateForm(form.id, "unitPrice", item?.price || 0);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select item" />
                        </SelectTrigger>
                        <SelectContent>
                          {inventoryItems.map((item: InventoryItem) => (
                            <SelectItem
                              key={item.id}
                              value={item.id.toString()}
                            >
                              {item.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="w-24 space-y-2">
                      <Label className="xs text-muted-foreground">
                        Quantity
                      </Label>
                      <Input
                        type="number"
                        min="1"
                        value={form.quantity.toLocaleString()}
                        onChange={(e) =>
                          updateForm(
                            form.id,
                            "quantity",
                            parseInt(e.target.value.replace(/,/g, "")) || 1
                          )
                        }
                        className="h-9"
                      />
                    </div>

                    <div className="w-24 space-y-2">
                      <Label className="xs text-muted-foreground">Unit</Label>
                      <Input
                        value={getUnitSymbol(itemDetails?.unit || "")}
                        readOnly
                        className="h-9 bg-muted/50"
                      />
                    </div>

                    <div className="w-24 space-y-2">
                      <Label className="xs text-muted-foreground">Price</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.unitPrice !== undefined ? form.unitPrice : (itemDetails?.price || 0)}
                        onChange={(e) =>
                          updateForm(
                            form.id,
                            "unitPrice",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="h-9"
                      />
                    </div>

                    <div className="w-24 space-y-2">
                      <Label className="xs text-muted-foreground">Total</Label>
                      <Input
                        value={getFormTotal(form).toLocaleString("en-US")}
                        readOnly
                        className="h-9 bg-muted/50 font-semibold"
                      />
                    </div>

                    <div className="flex gap-2">
                      {itemForms.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-destructive hover:text-destructive"
                          onClick={() => removeForm(form.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Add New Item Button */}
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={addNewForm}
              >
                <Plus className="h-4 w-4" />
                Add Another Item
              </Button>

              {/* Order Summary */}
              <div className="mt-6 pt-4 border-border space-y-3">
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                  <span>Total</span>
                  <span className="text-primary">
                    {total.toLocaleString("en-US")}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate("/purchases")}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 gradient-primary text-primary-foreground shadow-glow hover:shadow-lg transition-shadow"
                  disabled={
                    isLoading || !isFormValid || createMutation.isPending
                  }
                  onClick={handleSubmit}
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Purchase Order"
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
