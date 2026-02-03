import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StockRequestService } from "@/services/stockRequestService";
import { DepartmentInventoryService, DepartmentInventoryItem } from "@/services/departmentInventoryService";
import { toast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

export default function StockRequestNew() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [department, setDepartment] = useState('KITCHEN');
  const [requestedBy, setRequestedBy] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [quantities, setQuantities] = useState<Record<number, string>>({});
  
  const queryClient = useQueryClient();

  // Initialize department from search params
  useEffect(() => {
    const dept = searchParams.get('department');
    if (dept) {
      setDepartment(dept.toUpperCase());
    }
  }, [searchParams]);

  // Fetch department inventory
  const { data: inventoryItems = [], isLoading: isLoadingInventory } = useQuery({
    queryKey: ['department-inventory', department],
    queryFn: async () => {
      const items = await DepartmentInventoryService.getDepartmentInventory(department);
      return items;
    },
  });

  const filteredItems = (inventoryItems as DepartmentInventoryItem[]).filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) && item.currentStock > 0
  );

  const handleQuantityChange = (itemId: number, value: string) => {
    setQuantities({ ...quantities, [itemId]: value });
  };

  // Create stock request mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return StockRequestService.createStockRequest(data);
    },
    onSuccess: () => {
      toast({
        title: "Stock Request Created",
        description: "Your stock request has been submitted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['stock-requests'] });
      queryClient.invalidateQueries({ queryKey: ['department-inventory', department] });
      navigate(-1);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create stock request.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    // Filter items with quantities > 0
    const itemsWithQuantities = Object.entries(quantities)
      .filter(([_, value]) => parseFloat(value) > 0)
      .map(([itemId, quantity]) => ({
        itemId: parseInt(itemId),
        quantity: parseFloat(quantity),
      }));

    if (itemsWithQuantities.length === 0) {
      toast({
        title: "No Items Selected",
        description: "Please enter quantities for at least one item.",
        variant: "destructive",
      });
      return;
    }

    if (!requestedBy.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter your name.",
        variant: "destructive",
      });
      return;
    }

    const data = {
      requestedBy,
      requestedFrom: department,
      requestItems: itemsWithQuantities,
    };

    createMutation.mutate(data);
  };

  // Check if any quantity has been entered
  const hasQuantities = Object.values(quantities).some(v => parseFloat(v) > 0);

  return (
    <MainLayout title="New Inventory Request">
      <div className="space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        {/* Inventory Request Card */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Inv Request</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="w-full sm:w-48">
                <label className="text-sm text-muted-foreground">Department</label>
                <Input 
                  value={department} 
                  onChange={(e) => {
                    setDepartment(e.target.value.toUpperCase());
                    setQuantities({});
                  }}
                  className="mt-1"
                />
              </div>
              <div className="flex-1">
                <label className="text-sm text-muted-foreground">Requested By</label>
                <Input 
                  placeholder="Enter your name"
                  value={requestedBy}
                  onChange={(e) => setRequestedBy(e.target.value)}
                  className="mt-1"
                />
              </div>
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

            {/* Inventory Table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Quantity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingInventory ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">Loading...</TableCell>
                  </TableRow>
                ) : filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">No items found</TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {item.currentStock} {item.unit}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          className="w-24"
                          placeholder="Qty"
                          value={quantities[item.id] || ''}
                          onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={createMutation.isPending || !hasQuantities}
          >
            {createMutation.isPending ? 'Creating...' : 'Submit Request'}
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}