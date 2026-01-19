import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Trash2, Search, Edit2, Save } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const menuItems = [
  { id: 1, name: "Caesar Salad", price: 14.00, category: "Appetizers" },
  { id: 2, name: "Lobster Bisque", price: 18.00, category: "Appetizers" },
  { id: 3, name: "Grilled Salmon", price: 32.00, category: "Mains" },
  { id: 4, name: "Ribeye Steak", price: 45.00, category: "Mains" },
  { id: 5, name: "Chicken Parmesan", price: 26.00, category: "Mains" },
  { id: 6, name: "Tiramisu", price: 10.00, category: "Desserts" },
  { id: 7, name: "House Red Wine", price: 12.00, category: "Beverages" },
  { id: 8, name: "Espresso", price: 4.00, category: "Beverages" },
];

const tables = ["Table 1", "Table 2", "Table 3", "Table 4", "Table 5", "Table 6", "Table 7", "Table 8", "Table 9", "Table 10", "Table 11", "Table 12"];
const waiters = ["Sarah M.", "Mike R.", "James T.", "Emily W."];

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  notes: string;
  editingNotes: boolean;
}

export default function OrderNew() {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMenuItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addItem = (item: typeof menuItems[0]) => {
    const existing = orderItems.find(oi => oi.id === item.id);
    if (existing) {
      setOrderItems(orderItems.map(oi =>
        oi.id === item.id ? { ...oi, quantity: oi.quantity + 1 } : oi
      ));
    } else {
      setOrderItems([...orderItems, { ...item, quantity: 1, notes: "", editingNotes: false }]);
    }
  };

  const removeItem = (id: number) => {
    setOrderItems(orderItems.filter(oi => oi.id !== id));
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity < 1) return;
    setOrderItems(orderItems.map(oi =>
      oi.id === id ? { ...oi, quantity } : oi
    ));
  };

  const updateNotes = (id: number, notes: string) => {
    setOrderItems(orderItems.map(oi =>
      oi.id === id ? { ...oi, notes } : oi
    ));
  };

  const toggleNotesEditing = (id: number) => {
    setOrderItems(orderItems.map(oi =>
      oi.id === id ? { ...oi, editingNotes: !oi.editingNotes } : oi
    ));
  };

  const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

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
                      onClick={() => addItem(item)}
                      className="flex flex-col items-start p-3 rounded-lg border border-border bg-card hover:bg-muted/50 hover:border-primary/50 transition-all text-left"
                    >
                      <span className="font-medium text-sm text-foreground">{item.name}</span>
                      <span className="text-xs text-muted-foreground">{item.category}</span>
                      <span className="text-sm font-semibold text-primary mt-1">${item.price.toFixed(2)}</span>
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
                      <div key={item.id} className="flex flex-col gap-3 p-3 rounded-lg bg-muted/30">
                        <div className="flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-foreground truncate">{item.name}</p>
                            <p className="text-sm text-primary">${item.price.toFixed(2)}</p>
                            {item.notes && (
                              <p className="text-xs text-muted-foreground mt-1">
                                <Badge variant="secondary" className="text-xs">Note: {item.notes}</Badge>
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              -
                            </Button>
                            <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              +
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:text-destructive"
                              onClick={() => removeItem(item.id)}
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
                                onChange={(e) => updateNotes(item.id, e.target.value)}
                                placeholder="Add special instructions..."
                                className="text-xs h-16"
                                autoFocus
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => toggleNotesEditing(item.id)}
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 gap-1 text-xs"
                              onClick={() => toggleNotesEditing(item.id)}
                            >
                              <Edit2 className="h-3 w-3" />
                              {item.notes ? "Edit Note" : "Add Note"}
                            </Button>
                          )}
                        </div>
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
