import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, ArrowUpDown, Package, CheckCircle2, Plus, X } from "lucide-react";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const inventoryItems = [
  { id: 1, name: "Salmon Fillet", category: "Proteins", quantity: 15, unit: "kg" },
  { id: 2, name: "Beef Tenderloin", category: "Proteins", quantity: 8, unit: "kg" },
  { id: 3, name: "Heavy Cream", category: "Dairy", quantity: 3, unit: "L" },
  { id: 4, name: "Arborio Rice", category: "Grains", quantity: 12, unit: "kg" },
  { id: 5, name: "Dark Chocolate", category: "Baking", quantity: 2, unit: "kg" },
  { id: 6, name: "Mascarpone", category: "Dairy", quantity: 4, unit: "kg" },
  { id: 7, name: "Garlic", category: "Produce", quantity: 5, unit: "kg" },
  { id: 8, name: "Truffle Oil", category: "Oils", quantity: 1, unit: "L" },
];

const requestItems = [
  { id: "REQ-001", items: ["Salmon Fillet", "Heavy Cream"], count: 2, requestedAt: "2024-01-15 10:30 AM", status: "pending" },
  { id: "REQ-002", items: ["Arborio Rice", "Dark Chocolate"], count: 2, requestedAt: "2024-01-14 03:15 PM", status: "approved" },
];

// Available inventory items for requesting
const availableItems = [
  { id: 1, name: "Salmon Fillet", category: "Proteins", unit: "kg" },
  { id: 2, name: "Beef Tenderloin", category: "Proteins", unit: "kg" },
  { id: 3, name: "Heavy Cream", category: "Dairy", unit: "L" },
  { id: 4, name: "Arborio Rice", category: "Grains", unit: "kg" },
  { id: 5, name: "Dark Chocolate", category: "Baking", unit: "kg" },
  { id: 6, name: "Mascarpone", category: "Dairy", unit: "kg" },
  { id: 7, name: "Garlic", category: "Produce", unit: "kg" },
  { id: 8, name: "Truffle Oil", category: "Oils", unit: "L" },
];

export default function KitchenInventory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("items");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [updateAmount, setUpdateAmount] = useState("");
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestItemsList, setRequestItemsList] = useState<any[]>([]);
  const [searchItemQuery, setSearchItemQuery] = useState("");
  const [autocompleteItems, setAutocompleteItems] = useState<any[]>([]);

  const filteredItems = inventoryItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRequests = requestItems.filter((item) =>
    item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.items.join(", ").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUpdateClick = (item: any) => {
    setSelectedItem(item);
    setUpdateAmount("");
    setIsUpdateModalOpen(true);
  };

  const handleUpdateSubmit = () => {
    if (!updateAmount || isNaN(parseFloat(updateAmount)) || parseFloat(updateAmount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    console.log(`Updating inventory for ${selectedItem.name}: used ${updateAmount} ${selectedItem.unit}`);
    // In a real app, this would call an API to update the inventory
    setIsUpdateModalOpen(false);
  };

  return (
    <MainLayout title="Kitchen Inventory">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* <div>
            <h1 className="text-3xl font-bold text-foreground">Kitchen Inventory</h1>
            <p className="text-muted-foreground mt-1">Track kitchen stock levels</p>
          </div> */}
          <div className="flex gap-2">
            {/* Request button moved to Requests tab */}
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-muted/50 w-full">
            <TabsTrigger value="items" className="flex-1">Items</TabsTrigger>
            <TabsTrigger value="requests" className="flex-1">Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="items" className="mt-6">
            <div className="space-y-6">
              {/* Search */}
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search inventory..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Inventory Table */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Inventory Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>{item.category}</TableCell>
                          <TableCell>{item.quantity} {item.unit}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleUpdateClick(item)}
                            >
                              Update
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="requests" className="mt-6">
            <div className="space-y-6">
              {/* Request Stock Button */}
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setIsRequestModalOpen(true)}>
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  Request Stock
                </Button>
              </div>

              {/* Search */}
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search requests..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Requests Table */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Stock Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Request ID</TableHead>
                        <TableHead>Requested At</TableHead>
                        <TableHead>Items Count</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRequests.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.id}</TableCell>
                          <TableCell>{item.requestedAt}</TableCell>
                          <TableCell>{item.count} items</TableCell>
                          <TableCell>
                            <Badge variant={item.status === "approved" ? "default" : "secondary"}>
                              {item.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Update Inventory Modal */}
        <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Inventory Usage</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Item Name</Label>
                  <p className="font-medium">{selectedItem?.name}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Current Quantity</Label>
                  <p className="font-medium">{selectedItem?.quantity} {selectedItem?.unit}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="update-amount">Amount Used</Label>
                <Input
                  id="update-amount"
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder={`Enter amount in ${selectedItem?.unit}`}
                  value={updateAmount}
                  onChange={(e) => setUpdateAmount(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Enter the amount of {selectedItem?.name} that was used
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsUpdateModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateSubmit}>
                Update Inventory
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Stock Request Modal */}
        <Dialog open={isRequestModalOpen} onOpenChange={setIsRequestModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Stock Request</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Search and Add Items */}
              <div className="space-y-3">
                <Label>Search and Add Items</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search items by name..."
                    className="pl-10"
                    value={searchItemQuery}
                    onChange={(e) => {
                      setSearchItemQuery(e.target.value);
                      if (e.target.value.length > 0) {
                        setAutocompleteItems(availableItems.filter(item =>
                          item.name.toLowerCase().includes(e.target.value.toLowerCase())
                        ));
                      } else {
                        setAutocompleteItems([]);
                      }
                    }}
                  />
                </div>

                {/* Search Results */}
                {searchItemQuery.length > 0 && autocompleteItems.length > 0 && (
                  <div className="border rounded-lg max-h-48 overflow-y-auto">
                    {autocompleteItems.map(item => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 hover:bg-muted/30 cursor-pointer"
                        onClick={() => {
                            const existing = requestItemsList.find(req => req.id === item.id);
                            if (!existing) {
                              setRequestItemsList([...requestItemsList, { ...item, quantity: 1 }]);
                            }
                            setSearchItemQuery("");
                            setAutocompleteItems([]);
                          }}
                      >
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">{item.category}</p>
                        </div>
                        <Plus className="h-4 w-4 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Items */}
              {requestItemsList.length > 0 ? (
                <div className="space-y-3">
                  <Label>Requested Items ({requestItemsList.length})</Label>
                  <div className="space-y-2">
                    {requestItemsList.map(item => (
                      <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">{item.category}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="1"
                            className="w-20 h-8"
                            value={item.quantity}
                            onChange={(e) => {
                              const value = parseInt(e.target.value) || 1;
                              setRequestItemsList(requestItemsList.map(req =>
                                req.id === item.id ? { ...req, quantity: value } : req
                              ));
                            }}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setRequestItemsList(requestItemsList.filter(req => req.id !== item.id))}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No items added yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Search for items above to add them to your request</p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRequestModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (requestItemsList.length === 0) {
                    alert("Please add at least one item");
                    return;
                  }
                  console.log("Submitting stock request:", requestItemsList);
                  // In a real app, this would call an API to create the request
                  setIsRequestModalOpen(false);
                  setRequestItemsList([]);
                  setSearchItemQuery("");
                  setAutocompleteItems([]);
                }}
              >
                Submit Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
