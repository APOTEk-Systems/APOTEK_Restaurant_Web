import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Trash2, Search, Edit2, Save } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const menuItems = [
  { id: 1, name: "Caesar Salad", price: 14.00, category: "Appetizers" },
  { id: 2, name: "Lobster Bisque", price: 18.00, category: "Appetizers" },
  { id: 3, name: "Grilled Salmon", price: 32.00, category: "Mains", requiresSideDish: false },
  { id: 4, name: "Ribeye Steak", price: 45.00, category: "Mains", requiresSideDish: true },
  { id: 5, name: "Chicken Parmesan", price: 26.00, category: "Mains", requiresSideDish: true },
  { id: 6, name: "Tiramisu", price: 10.00, category: "Desserts" },
  { id: 7, name: "House Red Wine", price: 12.00, category: "Beverages" },
  { id: 8, name: "Espresso", price: 4.00, category: "Beverages" },
  { id: 9, name: "Margherita Pizza", price: 18.00, category: "Mains", hasAddons: true },
];

const sideDishes = [
  { id: 101, name: "Garlic Mashed Potatoes", price: 5.99 },
  { id: 102, name: "Seasonal Vegetables", price: 4.99 },
  { id: 103, name: "Truffle Fries", price: 6.99 },
  { id: 104, name: "House Salad", price: 4.99 },
  { id: 105, name: "Grilled Asparagus", price: 5.99 },
  { id: 106, name: "Rice Pilaf", price: 3.99 },
];

const pizzaAddons = [
  { id: 201, name: "Extra Cheese", price: 2.99 },
  { id: 202, name: "Pepperoni", price: 3.99 },
  { id: 203, name: "Mushrooms", price: 2.49 },
  { id: 204, name: "Olives", price: 1.99 },
  { id: 205, name: "Bacon", price: 3.49 },
  { id: 206, name: "Jalapeños", price: 1.99 },
];

const tables = ["Table 1", "Table 2", "Table 3", "Table 4", "Table 5", "Table 6", "Table 7", "Table 8", "Table 9", "Table 10", "Table 11", "Table 12"];
const waiters = ["Sarah M.", "Mike R.", "James T.", "Emily W."];

interface OrderItem {
  instanceId: string; // Unique ID for each instance of an order item
  id: number;
  name: string;
  price: number;
  quantity: number;
  notes: string;
  editingNotes: boolean;
  sideDishes?: { id: number; name: string; price: number }[];
  showSideDishSelector?: boolean;
  addons?: { id: number; name: string; price: number }[];
  showAddonsDialog?: boolean;
  showExtrasDialog?: boolean;
  requiresSideDish?: boolean;
  hasAddons?: boolean;
}

export default function OrderNew() {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const now = new Date();

  const filteredMenuItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addItem = (item: typeof menuItems[0]): string => { // Add return type
    const newItem: OrderItem = {
      instanceId: new Date().toISOString(), // Generate a unique ID for this instance
      ...item,
      quantity: 1, // Quantity is always 1 for a unique entry
      notes: "",
      editingNotes: false,
      sideDishes: [],
      showSideDishSelector: item.requiresSideDish || false,
      addons: [],
      showAddonsDialog: item.hasAddons || false,
      showExtrasDialog: item.requiresSideDish || item.hasAddons || false,
      requiresSideDish: item.requiresSideDish,
      hasAddons: item.hasAddons
    };
    setOrderItems(prevItems => [...prevItems, newItem]);
    return newItem.instanceId; // Return the instanceId
  };

  const removeItem = (instanceId: string) => {
    setOrderItems(orderItems.filter(oi => oi.instanceId !== instanceId));
  };

  const updateNotes = (instanceId: string, notes: string) => {
    setOrderItems(orderItems.map(oi =>
      oi.instanceId === instanceId ? { ...oi, notes } : oi
    ));
  };

  const toggleNotesEditing = (instanceId: string) => {
    setOrderItems(orderItems.map(oi =>
      oi.instanceId === instanceId ? { ...oi, editingNotes: !oi.editingNotes } : oi
    ));
  };

  const total = orderItems.reduce((sum, item) => {
    const itemTotal = item.price; // Quantity is implicitly 1
    const sideDishTotal = item.sideDishes?.reduce((sideSum, sideDish) => sideSum + sideDish.price, 0) || 0;
    const addonsTotal = item.addons?.reduce((addonSum, addon) => addonSum + addon.price, 0) || 0;
    return sum + itemTotal + sideDishTotal + addonsTotal; // No multiplication by quantity
  }, 0);

  return (
    <MainLayout title="New Order" subtitle="Create a new customer order">
      <div className="space-y-6 animate-fade-in">
        {/* Back Button */}
        <Link to="/orders">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </Button>
        </Link>

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
                      onClick={() => {
                        const newInstanceId = addItem(item);
                        // Auto-open dialog for items with addons or sides
                        if (item.requiresSideDish || item.hasAddons) {
                          setOrderItems(prevItems => prevItems.map(oi =>
                            oi.instanceId === newInstanceId ? { ...oi, showExtrasDialog: true } : oi
                          ));
                        }
                      }}
                      className="flex flex-col items-start p-3 rounded-lg border border-border bg-card hover:bg-muted/50 hover:border-primary/50 transition-all text-left"
                    >
                      <span className="font-medium text-sm text-foreground">{item.name}</span>
                      <span className="text-xs text-muted-foreground">{item.category}</span>
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
                            <p className="text-sm text-primary">${item.price.toFixed(2)}</p>
                            {item.notes && (
                              <p className="text-xs text-muted-foreground mt-1">
                                <Badge variant="secondary" className="text-xs">Note: {item.notes}</Badge>
                              </p>
                            )}
                            {item.sideDishes && item.sideDishes.length > 0 && (
                              <div className="mt-1">
                                <p className="text-xs text-muted-foreground">
                                  Sides: {item.sideDishes.map(side => `${side.name} (+$${side.price.toFixed(2)})`).join(', ')}
                                </p>
                              </div>
                            )}
                            {item.addons && item.addons.length > 0 && (
                              <div className="mt-1">
                                <p className="text-xs text-muted-foreground">
                                  Addons: {item.addons.map(addon => `${addon.name} (+$${addon.price.toFixed(2)})`).join(', ')}
                                </p>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
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
                                setOrderItems(orderItems.map(oi =>
                                  oi.instanceId === item.instanceId ? { ...oi, showExtrasDialog: true } : oi
                                ));
                              }}
                            >
                              <Plus className="h-3 w-3" />
                              {(item.sideDishes && item.sideDishes.length > 0) || (item.addons && item.addons.length > 0)
                                ? "Edit Extras"
                                : "Add Extras"}
                            </Button>
                          )}
                        </div>

                        {/* Unified Extras Dialog */}
                        {item.showExtrasDialog && (
                          <div className="mt-2">
                            <Dialog open={item.showExtrasDialog} onOpenChange={(open) => {
                              setOrderItems(orderItems.map(oi =>
                                oi.instanceId === item.instanceId ? { ...oi, showExtrasDialog: open } : oi
                              ));
                            }}>
                              <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                  <DialogTitle>
                                    {item.requiresSideDish ? `Select Side Dishes for ${item.name}` : `Customize ${item.name}`}
                                  </DialogTitle>
                                </DialogHeader>

                                {/* Item Details Section */}
                                <div className="mb-4 p-3 bg-muted/30 rounded-lg">
                                  <h3 className="font-medium text-sm mb-2">Item Details</h3>
                                  <p className="text-sm text-foreground">{item.name}</p>
                                  <p className="text-sm text-primary">${item.price.toFixed(2)}</p>
                                  <p className="text-xs text-muted-foreground mt-1">Base item</p>
                                </div>

                                {/* Done Button */}
                                <div className="flex justify-end mb-4">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setOrderItems(orderItems.map(oi =>
                                        oi.instanceId === item.instanceId ? { ...oi, showExtrasDialog: false } : oi
                                      ));
                                    }}
                                  >
                                    Done
                                  </Button>
                                </div>

                                {/* Side Dishes Section (if applicable) */}
                                {item.requiresSideDish && (
                                  <>
                                    <h3 className="font-medium text-sm mb-2">Side Dishes</h3>
                                    <div className="grid grid-cols-2 gap-2 mb-4">
                                      {sideDishes.map(sideDish => {
                                        const isSelected = item.sideDishes?.some(s => s.id === sideDish.id);
                                        return (
                                          <div
                                            key={sideDish.id}
                                            className={`flex items-center gap-2 p-2 rounded border cursor-pointer ${isSelected ? 'bg-primary/10 border-primary' : 'hover:bg-muted'}`}
                                            onClick={() => {
                                              const newSideDishes = isSelected
                                                ? item.sideDishes?.filter(s => s.id !== sideDish.id)
                                                : [...(item.sideDishes || []), sideDish];

                                              setOrderItems(orderItems.map(oi =>
                                                oi.instanceId === item.instanceId ? { ...oi, sideDishes: newSideDishes } : oi
                                              ));
                                            }}
                                          >
                                            <input
                                              type="checkbox"
                                              checked={isSelected || false}
                                              onChange={() => {}}
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
                                {item.hasAddons && (
                                  <>
                                    <h3 className="font-medium text-sm mb-2">Addons</h3>
                                    <div className="grid grid-cols-2 gap-2">
                                      {pizzaAddons.map(addon => {
                                        const isSelected = item.addons?.some(a => a.id === addon.id);
                                        return (
                                          <div
                                            key={addon.id}
                                            className={`flex items-center gap-2 p-2 rounded border cursor-pointer ${isSelected ? 'bg-primary/10 border-primary' : 'hover:bg-muted'}`}
                                            onClick={() => {
                                              const newAddons = isSelected
                                                ? item.addons?.filter(a => a.id !== addon.id)
                                                : [...(item.addons || []), addon];

                                              setOrderItems(orderItems.map(oi =>
                                                oi.instanceId === item.instanceId ? { ...oi, addons: newAddons } : oi
                                              ));
                                            }}
                                          >
                                            <input
                                              type="checkbox"
                                              checked={isSelected || false}
                                              onChange={() => {}}
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
                              </DialogContent>
                            </Dialog>
                          </div>
                        )}


                      </div>
                    ))}
                  </div>
                )}

                {/* Order Details */}
                <div className="pt-4 border-t border-border space-y-4">
                  <div className="grid grid-rows-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="table" className="text-xs text-muted-foreground">Table</Label>
                      <Select>
                        <SelectTrigger id="table" className="h-9 text-sm">
                          <SelectValue placeholder="Select table" />
                        </SelectTrigger>
                        <SelectContent>
                          {tables.map(table => (
                            <SelectItem key={table} value={table}>{table}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="waiter" className="text-xs text-muted-foreground">Waiter</Label>
                      <Select>
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
                  <Button className="flex-1 gradient-primary text-primary-foreground shadow-glow hover:shadow-lg transition-shadow">
                    Create Order
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
