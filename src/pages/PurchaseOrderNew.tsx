import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, Trash2, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SupplierService, Supplier } from "@/services/supplierService";
import { inventoryItemService, InventoryItem } from "@/services/inventoryItemService";
import { purchaseOrderService } from "@/services/purchaseOrderService";

interface PurchaseItem {
  id: number;
  name: string;
  unit: string;
  quantity: number;
  price: number;
}

export default function PurchaseOrderNew() {
  const [selectedSupplier, setSelectedSupplier] = useState<string>("");
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([]);
  const [newItem, setNewItem] = useState({
    itemId: "",
    quantity: 1
  });
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch suppliers using React Query
  const { data: suppliers = [] } = useQuery({
    queryKey: ["suppliers"],
    queryFn: SupplierService.getAllSuppliers,
  });

  // Fetch inventory items using React Query
  const { data: inventoryItems = [] } = useQuery({
    queryKey: ["inventoryItems"],
    queryFn: inventoryItemService.getAllInventoryItems,
  });

  // Create purchase order mutation
  const createMutation = useMutation({
    mutationFn: (data: {
      poNumber: string;
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
      navigate("/purchases");
    },
  });

  const addItem = () => {
    if (!newItem.itemId) return;

    const selectedItem = inventoryItems.find((item: InventoryItem) => item.id.toString() === newItem.itemId);
    if (!selectedItem) return;

    const existingItem = purchaseItems.find(item => item.id === selectedItem.id);
    if (existingItem) {
      setPurchaseItems(purchaseItems.map(item =>
        item.id === selectedItem.id
          ? { ...item, quantity: item.quantity + newItem.quantity }
          : item
      ));
    } else {
      setPurchaseItems([...purchaseItems, {
        id: selectedItem.id,
        name: selectedItem.name,
        unit: selectedItem.unit,
        quantity: newItem.quantity,
        price: selectedItem.price || 0
      }]);
    }

    // Reset form
    setNewItem({ itemId: "", quantity: 1 });
  };

  const removeItem = (id: number) => {
    setPurchaseItems(purchaseItems.filter(item => item.id !== id));
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity < 1) return;
    setPurchaseItems(purchaseItems.map(item =>
      item.id === id ? { ...item, quantity } : item
    ));
  };

  const subtotal = purchaseItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  // Generate PO number
  const generatePONumber = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `PO-${year}${month}${day}-${random}`;
  };

  const handleSubmit = () => {
    if (!selectedSupplier || purchaseItems.length === 0) return;

    const supplierId = parseInt(selectedSupplier);

    createMutation.mutate({
      poNumber: generatePONumber(),
      supplierId,
      items: purchaseItems.map(item => ({
        inventoryItemId: item.id,
        quantityOrdered: item.quantity,
        unitPrice: item.price
      }))
    });
  };

  const handleSaveDraft = () => {
    // For now, just save locally or implement draft functionality
    console.log("Saving draft...", {
      supplierId: selectedSupplier,
      items: purchaseItems
    });
  };

  return (
    <MainLayout title="Create Purchase Order" subtitle="Create a new purchase order for suppliers">
      <div className="space-y-6 animate-fade-in">
        {/* Back Button */}
        <Link to="/purchases">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Purchase Orders
          </Button>
        </Link>

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
              <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                <SelectTrigger id="supplier" className="w-full">
                  <SelectValue placeholder="Select a supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((supplier: Supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id.toString()}>
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

              {/* Add Item Form */}
              <div className="flex flex-col sm:flex-row gap-3 items-end">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="item" className="xs text-muted-foreground">Item</Label>
                  <Select
                    value={newItem.itemId}
                    onValueChange={(value) => setNewItem({...newItem, itemId: value})}
                  >
                    <SelectTrigger id="item">
                      <SelectValue placeholder="Select item" />
                    </SelectTrigger>
                    <SelectContent>
                      {inventoryItems.map((item: InventoryItem) => (
                        <SelectItem key={item.id} value={item.id.toString()}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-24 space-y-2">
                  <Label htmlFor="quantity" className="xs text-muted-foreground">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value) || 1})}
                    className="h-9"
                  />
                </div>

                <div className="w-24 space-y-2">
                  <Label className="xs text-muted-foreground">Unit</Label>
                  <Input
                    value={inventoryItems.find((item: InventoryItem) => item.id.toString() === newItem.itemId)?.unit || ""}
                    readOnly
                    className="h-9 bg-muted/50"
                  />
                </div>

                <div className="w-24 space-y-2">
                  <Label className="xs text-muted-foreground">Price</Label>
                  <Input
                    value={inventoryItems.find((item: InventoryItem) => item.id.toString() === newItem.itemId)?.price?.toFixed(2) || "0.00"}
                    readOnly
                    className="h-9 bg-muted/50"
                  />
                </div>

                <Button
                  onClick={addItem}
                  className="h-9 gap-2"
                  disabled={!newItem.itemId}
                >
                  <Plus className="h-4 w-4" />
                  Add Item
                </Button>
              </div>

              {/* Items List */}
              {purchaseItems.length > 0 && (
                <div className="space-y-3 border-t border-border pt-4">
                  <div className="grid grid-cols-5 gap-3 text-xs font-medium text-muted-foreground pb-2">
                    <div>Item</div>
                    <div className="text-center">Quantity</div>
                    <div className="text-center">Unit</div>
                    <div className="text-right">Price</div>
                    <div className="text-right">Total</div>
                  </div>

                  {purchaseItems.map(item => (
                    <div key={item.id} className="grid grid-cols-5 gap-3 items-center py-2 border-b border-border/50">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-center">
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                          className="h-8 w-16 mx-auto text-center"
                        />
                      </div>
                      <div className="text-center text-muted-foreground">{item.unit}</div>
                      <div className="text-right">${item.price.toFixed(2)}</div>
                      <div className="text-right font-semibold">${(item.price * item.quantity).toFixed(2)}</div>
                      <div className="flex justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Order Summary */}
              <div className="mt-6 pt-4 border-t border-border space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax (10%)</span>
                  <span className="font-semibold">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                  <span>Total</span>
                  <span className="text-primary">${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={handleSaveDraft}
                >
                  Save Draft
                </Button>
                <Button
                  className="flex-1 gradient-primary text-primary-foreground shadow-glow hover:shadow-lg transition-shadow"
                  disabled={!selectedSupplier || purchaseItems.length === 0 || createMutation.isPending}
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