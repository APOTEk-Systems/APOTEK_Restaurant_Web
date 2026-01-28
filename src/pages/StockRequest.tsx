import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Loader2 } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { InventoryService } from "@/services/inventoryService";

interface InventoryItem {
  id: number;
  name: string;
  categoryName: string;
  currentStock: number;
  departmentInventoryId: number | null;
  unit: string;
  department: string;
}

export default function StockRequestPage() {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const departmentParam = searchParams.get("department") || "KITCHEN";
  const department = departmentParam.toUpperCase();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [requestItems, setRequestItems] = useState<Map<number, number>>(new Map());

  // Fetch department inventory using React Query
  const { data: inventoryItems = [], isLoading } = useQuery({
    queryKey: ['departmentInventory', department],
    queryFn: () => InventoryService.getDepartmentInventory(department),
  });

  // Create stock request mutation using React Query
  const createStockRequestMutation = useMutation({
    mutationFn: (data: { requestedFrom: 'KITCHEN' | 'BAR'; requestItems: { itemId: number; quantity: number }[] }) =>
      InventoryService.createStockRequest(data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Stock request submitted successfully",
      });
      setRequestItems(new Map());
      queryClient.invalidateQueries({ queryKey: ['stockRequests', department] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit stock request",
        variant: "destructive",
      });
    },
  });

  const filteredItems = inventoryItems.filter((item: InventoryItem) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.categoryName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const updateQuantity = (itemId: number, quantity: number) => {
    setRequestItems((prev) => {
      const newMap = new Map(prev);
      if (quantity <= 0 || isNaN(quantity)) {
        newMap.delete(itemId);
      } else {
        newMap.set(itemId, quantity);
      }
      return newMap;
    });
  };

  const getItemQuantity = (itemId: number) => {
    return requestItems.get(itemId) || 0;
  };

  const submitStockRequest = async () => {
    if (requestItems.size === 0) {
      toast({
        title: "Error",
        description: "Please add at least one item",
        variant: "destructive",
      });
      return;
    }

    createStockRequestMutation.mutate({
      requestedFrom: department as 'KITCHEN' | 'BAR',
      requestItems: Array.from(requestItems.entries()).map(([itemId, quantity]) => ({
        itemId,
        quantity,
      })),
    });
  };

  const totalItems = Array.from(requestItems.values()).reduce((sum, qty) => sum + qty, 0);

  return (
    <MainLayout title={`${department} Stock Requests`}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Request Stock</h2>
          <Badge variant="outline">{department} Department</Badge>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Inventory Table with Quantity Input */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Available Inventory</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead className="w-32">Quantity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No items found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredItems.map((item: InventoryItem) => {
                      const quantity = getItemQuantity(item.id);
                      return (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>{item.categoryName || 'Uncategorized'}</TableCell>
                          <TableCell>
                            <span className={item.currentStock === 0 ? "text-red-500" : ""}>
                              {item.currentStock} {item.unit}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              placeholder="0"
                              className="w-24 h-8"
                              value={quantity || ""}
                              onChange={(e) =>
                                updateQuantity(item.id, parseFloat(e.target.value) || 0)
                              }
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end items-center gap-4">
          {requestItems.size > 0 && (
            <span className="text-sm text-muted-foreground">
              {requestItems.size} item(s) selected • {totalItems} total units
            </span>
          )}
          <Button
            onClick={submitStockRequest}
            disabled={createStockRequestMutation.isPending || requestItems.size === 0}
          >
            {createStockRequestMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Stock Request"
            )}
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}