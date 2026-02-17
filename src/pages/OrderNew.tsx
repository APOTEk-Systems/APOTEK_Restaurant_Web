import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Trash2, Search, Edit2, Save, Minus, Plus as PlusIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { MenuService, MenuItem, Addon, SideDish, OrderItem } from "@/services/menuService";
import { OrderService } from "@/services/orderService";
import { TableService } from "@/services/tableService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const waiters = ["Sarah M.", "Mike R.", "James T.", "Emily W."];

export default function OrderNew() {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [selectedWaiter, setSelectedWaiter] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [showExtrasDialog, setShowExtrasDialog] = useState(false);
  const [currentItemId, setCurrentItemId] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch menu items using React Query
  const { data: menuItems, isLoading: isMenuLoading, error: menuError } = useQuery({
    queryKey: ['menuItems'],
    queryFn: MenuService.getAllMenuItems,
  });

  // Fetch tables from backend
  const { data: tables, isLoading: isTablesLoading } = useQuery({
    queryKey: ['tables'],
    queryFn: TableService.getAllTables,
  });

  // Fetch side dishes
  const { data: sideDishes, isLoading: isSidesLoading } = useQuery({
    queryKey: ['sideDishes'],
    queryFn: MenuService.getAllMenuSideDishes,
  });

  // Fetch addons
  const { data: addons, isLoading: isAddonsLoading } = useQuery({
    queryKey: ['addons'],
    queryFn: MenuService.getAllMenuAddons,
  });

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: OrderService.createOrder,
    onSuccess: () => {
      toast({
        title: "Order Created",
        description: "The order has been successfully created.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ['recentOrders'] });
      // Reset form
      setOrderItems([]);
      setSelectedTable("");
      setSelectedWaiter("");
      setCustomerName("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create order. Please try again.",
        variant: "destructive",
      });
    },
  });

  const filteredMenuItems = menuItems?.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const addItem = (item: MenuItem) => {
    // If the item is NOT customizable, try to find an existing one to increment.
    if (!item.requiresSideDish && !item.hasAddons) {
      const existingItem = orderItems.find(oi => oi.menuItemId === item.id && !oi.requiresSideDish && !oi.hasAddons);
      if (existingItem) {
        incrementQuantity(existingItem.instanceId);
        return; // Stop here
      }
    }

    // If the item is customizable, or it's a non-customizable item not yet in the cart,
    // create a new item instance.
    const newItem: OrderItem = {
      instanceId: Date.now(),
      name: item.name,
      price: item.price,
      quantity: 1,
      notes: "",
      editingNotes: false,
      sideDishes: [],
      addons: [],
      requiresSideDish: item.requiresSideDish,
      hasAddons: item.hasAddons,
      menuItemId: item.id,
      category: item.menuCategory?.name || 'General',
    };

    setOrderItems(prevItems => [...prevItems, newItem]);

    // Auto-open dialog only for customizable items.
    if (item.requiresSideDish || item.hasAddons) {
      setCurrentItemId(newItem.instanceId);
      setShowExtrasDialog(true);
    }
  };

  const removeItem = (instanceId: number) => {
    setOrderItems(orderItems.filter(oi => oi.instanceId !== instanceId));
  };

  const incrementQuantity = (instanceId: number) => {
    setOrderItems(orderItems.map(oi =>
      oi.instanceId === instanceId ? { ...oi, quantity: oi.quantity + 1 } : oi
    ));
  };

  const decrementQuantity = (instanceId: number) => {
    setOrderItems(orderItems.map(oi =>
      oi.instanceId === instanceId && oi.quantity > 1 ? { ...oi, quantity: oi.quantity - 1 } : oi
    ));
  };

  const updateNotes = (instanceId: number, notes: string) => {
    setOrderItems(orderItems.map(oi =>
      oi.instanceId === instanceId ? { ...oi, notes } : oi
    ));
  };

  const toggleNotesEditing = (instanceId: number) => {
    setOrderItems(orderItems.map(oi =>
      oi.instanceId === instanceId ? { ...oi, editingNotes: !oi.editingNotes } : oi
    ));
  };

  const updateSideDishes = (instanceId: number, sideDishes: SideDish[]) => {
    setOrderItems(orderItems.map(oi =>
      oi.instanceId === instanceId ? { ...oi, sideDishes } : oi
    ));
  };

  const updateAddons = (instanceId: number, addons: Addon[]) => {
    setOrderItems(orderItems.map(oi =>
      oi.instanceId === instanceId ? { ...oi, addons } : oi
    ));
  };

  const handleCreateOrder = () => {
    if (!selectedTable) {
      toast({
        title: "Error",
        description: "Please select a table.",
        variant: "destructive",
      });
      return;
    }

    if (orderItems.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one item to the order.",
        variant: "destructive",
      });
      return;
    }

    // Check if any items require side dishes but don't have them
    const itemsMissingSides = orderItems.filter(item =>
      item.requiresSideDish && (!item.sideDishes || item.sideDishes.length === 0)
    );

    if (itemsMissingSides.length > 0) {
      toast({
        title: "Error",
        description: `Please select side dishes for: ${itemsMissingSides.map(item => item.name).join(', ')}`,
        variant: "destructive",
      });
      return;
    }

    // selectedTable is now just the table number as a string
    const tableNumber = parseInt(selectedTable);

    const orderData = {
      tableNumber,
      customerName: customerName || null,
      waiter: selectedWaiter || null,
      orderItems: orderItems.map(item => ({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        notes: item.notes || null,
        selectedSideDishes: item.sideDishes?.map(sd => sd.id), // Pass an array of IDs
        selectedAddons: item.addons?.map(a => a.id), // Pass an array of IDs
      })),
    };

    createOrderMutation.mutate(orderData);
  };

  const total = orderItems.reduce((sum, item) => {
    const sideDishTotal = item.sideDishes?.reduce((sideSum, sideDish) => sideSum + sideDish.price, 0) || 0;
    const addonsTotal = item.addons?.reduce((addonSum, addon) => addonSum + addon.price, 0) || 0;
    const itemTotal = (item.price + sideDishTotal + addonsTotal) * item.quantity;
    return sum + itemTotal;
  }, 0);

  if (isMenuLoading || isSidesLoading || isAddonsLoading || isTablesLoading) {
    return (
      <MainLayout title="New Order" subtitle="Create a new customer order">
        <div className="space-y-6 animate-fade-in">
          <div className="text-center py-8">Loading data...</div>
        </div>
      </MainLayout>
    );
  }

  if (menuError) {
    return (
      <MainLayout title="New Order" subtitle="Create a new customer order">
        <div className="space-y-6 animate-fade-in">
          <div className="text-center py-8 text-destructive">Error loading menu: {menuError.message}</div>
        </div>
      </MainLayout>
    );
  }

  const currentItem = orderItems.find(item => item.instanceId === currentItemId);

  return (
    <MainLayout title="New Order" subtitle="Create a new customer order">
      <div className="space-y-6 animate-fade-in">
  

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Menu Items - Main Focus */}
          <div className="space-y-6">
            <Card className="shadow-card border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Menu Items</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search menu items..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[60vh] overflow-y-auto scrollbar-thin p-1">
                  {filteredMenuItems.map(item => (
                    <button
                      key={item.id}
                      onClick={() => addItem(item)}
                      className="flex flex-col items-start p-3 rounded-lg border border-border bg-card hover:bg-muted/50 hover:border-primary/50 transition-all text-left"
                    >
                      <span className="font-medium text-sm text-foreground">{item.name}</span>
                      <span className="text-xs text-muted-foreground">{item.menuCategory?.name || 'General'}</span>
                      <span className="text-sm font-semibold text-primary mt-1">${item.price.toFixed(2)}</span>
                      {(item.requiresSideDish || item.hasAddons) && (
                        <span className="text-xs text-muted-foreground mt-1">
                          {item.requiresSideDish ? "Includes sides" : "Customizable"}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary with Notes */}
          <div className="space-y-6">
            <Card className="shadow-card border-border/50 sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {orderItems.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-8">No items added yet</p>
                ) : (
                  <div className="space-y-3 max-h-[60vh] overflow-y-auto scrollbar-thin">
                    {orderItems.map(item => (
                      <div key={item.instanceId} className="flex flex-col gap-3 p-3 rounded-lg bg-muted/30">
                        <div className="flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-foreground truncate">{item.name}</p>
                            <p className="text-sm text-primary">${item.price.toFixed(2)} x {item.quantity}</p>
                            {((item.sideDishes && item.sideDishes.length > 0) || (item.addons && item.addons.length > 0)) && (
                              <p className="text-xs text-muted-foreground mt-1">
                                <Badge variant="secondary" className="text-xs">
                                  Extras:
                                  {item.sideDishes?.map(side => side.name).join(', ')}
                                  {item.sideDishes && item.sideDishes.length > 0 && item.addons && item.addons.length > 0 && ", "}
                                  {item.addons?.map(addon => addon.name).join(', ')}
                                </Badge>
                              </p>
                            )}
                            {item.notes && (
                              <p className="text-xs text-muted-foreground mt-1">
                                <Badge variant="secondary" className="text-xs">Note: {item.notes}</Badge>
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 border rounded-md">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => decrementQuantity(item.instanceId)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="text-xs px-2">{item.quantity}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => incrementQuantity(item.instanceId)}
                              >
                                <PlusIcon className="h-3 w-3" />
                              </Button>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:text-destructive"
                              onClick={() => removeItem(item.instanceId)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Notes Section */}
                        <div className="mt-2">
                          {item.editingNotes ? (
                            <div className="flex gap-2">
                              <Textarea
                                value={item.notes}
                                onChange={(e) => updateNotes(item.instanceId, e.target.value)}
                                placeholder="Add special instructions..."
                                className="text-xs h-16"
                                autoFocus
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => toggleNotesEditing(item.instanceId)}
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 gap-1 text-xs"
                              onClick={() => toggleNotesEditing(item.instanceId)}
                            >
                              <Edit2 className="h-3 w-3" />
                              {item.notes ? "Edit Note" : "Add Note"}
                            </Button>
                          )}

                          {/* Manual trigger button for extras */}
                          {(item.requiresSideDish || item.hasAddons) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 gap-1 text-xs"
                              onClick={() => {
                                setCurrentItemId(item.instanceId);
                                setShowExtrasDialog(true);
                              }}
                            >
                              <Plus className="h-3 w-3" />
                              {(item.sideDishes && item.sideDishes.length > 0) || (item.addons && item.addons.length > 0)
                                ? "Edit Extras"
                                : "Add Extras"}
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Order Details */}
                <div className="pt-4 border-t border-border space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="customerName" className="text-xs text-muted-foreground">Customer Name </Label>
                    <Input
                      id="customerName"
                      placeholder="Customer name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="table" className="text-xs text-muted-foreground">Table</Label>
                      <Select value={selectedTable} onValueChange={setSelectedTable}>
                        <SelectTrigger id="table" className="h-9 text-sm">
                          <SelectValue placeholder="Select table" />
                        </SelectTrigger>
                        <SelectContent>
                          {tables?.map(table => (
                            <SelectItem key={table.id} value={table.number.toString()}>
                              Table {table.number} (Capacity: {table.capacity})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="waiter" className="text-xs text-muted-foreground">Waiter</Label>
                      <Select value={selectedWaiter} onValueChange={setSelectedWaiter}>
                        <SelectTrigger id="waiter" className="h-9 text-sm">
                          <SelectValue placeholder="Select waiter" />
                        </SelectTrigger>
                        <SelectContent>
                          {waiters.map(waiter => (
                            <SelectItem key={waiter} value={waiter}>{waiter}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax (10%)</span>
                    <span className="text-foreground">${(total * 0.1).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold pt-2 border-t border-border">
                    <span className="text-foreground">Total</span>
                    <span className="text-primary">${(total * 1.1).toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button variant="outline" className="flex-1">Save Draft</Button>
                  <Button
                    className="flex-1 gradient-primary text-primary-foreground shadow-glow hover:shadow-lg transition-shadow"
                    onClick={handleCreateOrder}
                    disabled={createOrderMutation.isPending}
                  >
                    {createOrderMutation.isPending ? "Creating..." : "Create Order"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Unified Extras Dialog */}
      <Dialog open={showExtrasDialog} onOpenChange={setShowExtrasDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {currentItem?.requiresSideDish ? `Select Side Dishes for ${currentItem?.name}` : `Customize ${currentItem?.name}`}
            </DialogTitle>
          </DialogHeader>

          {currentItem && (() => {
            const originalMenuItem = menuItems?.find(mi => mi.id === currentItem.menuItemId);
            if (!originalMenuItem) return null;

            return (
              <>
                {/* Item Details Section */}
                <div className="mb-4 p-3 bg-muted/30 rounded-lg">
                  <h3 className="font-medium text-sm mb-2">Item Details</h3>
                  <p className="text-sm text-foreground">{currentItem.name}</p>
                  <p className="text-sm text-primary">${currentItem.price.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Base item</p>
                </div>

                {/* Side Dishes Section (if applicable) */}
                {currentItem.requiresSideDish && (
                  <>
                    <h3 className="font-medium text-sm mb-2">Side Dishes (Required - Select One)</h3>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {originalMenuItem.sideDishes?.map(sideDish => {
                        const isSelected = currentItem.sideDishes?.some(s => s.id === sideDish.id);
                        return (
                          <div
                            key={sideDish.id}
                            className={`flex items-center gap-2 p-2 rounded border cursor-pointer ${isSelected ? 'bg-primary/10 border-primary' : 'hover:bg-muted'}`}
                            onClick={() => {
                              // Single selection for side dishes
                              updateSideDishes(currentItem.instanceId, [sideDish]);
                            }}
                          >
                            <input
                              type="radio"
                              checked={isSelected || false}
                              onChange={() => { }}
                              className="h-4 w-4"
                              title={`Select ${sideDish.name}`}
                              aria-label={`Select ${sideDish.name}`}
                            />
                            <div className="flex-1">
                              <p className="text-xs font-medium">{sideDish.name}</p>
                              <p className="text-xs text-muted-foreground">${sideDish.price.toFixed(2)}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                {/* Addons Section (if applicable) */}
                {currentItem.hasAddons && (
                  <>
                    <h3 className="font-medium text-sm mb-2">Addons (Optional - Select Multiple)</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {originalMenuItem.addons?.map(addon => {
                        const isSelected = currentItem.addons?.some(a => a.id === addon.id);
                        return (
                          <div
                            key={addon.id}
                            className={`flex items-center gap-2 p-2 rounded border cursor-pointer ${isSelected ? 'bg-primary/10 border-primary' : 'hover:bg-muted'}`}
                            onClick={() => {
                              // Multiple selection for addons
                              const newAddons = isSelected
                                ? currentItem.addons?.filter(a => a.id !== addon.id)
                                : [...(currentItem.addons || []), addon];
                              updateAddons(currentItem.instanceId, newAddons || []);
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected || false}
                              onChange={() => { }}
                              className="h-4 w-4"
                              title={`Select ${addon.name}`}
                              aria-label={`Select ${addon.name}`}
                            />
                            <div className="flex-1">
                              <p className="text-xs font-medium">{addon.name}</p>
                              <p className="text-xs text-muted-foreground">${addon.price.toFixed(2)}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                {/* Done Button */}
                <div className="flex justify-end mt-4 pt-4 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowExtrasDialog(false)}
                  >
                    Done
                  </Button>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
