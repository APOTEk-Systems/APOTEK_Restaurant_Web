import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, ArrowLeft, Loader2, CheckCircle, XCircle } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StockRequestService } from "@/services/stockRequestService";
import { DepartmentInventoryService, DepartmentInventoryItem } from "@/services/departmentInventoryService";
import { toast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SubmitStatus = 'idle' | 'pending' | 'success' | 'error';

export default function StockRequestNew() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [department, setDepartment] = useState('KITCHEN');
  const [requestedBy, setRequestedBy] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [quantities, setQuantities] = useState<Record<number, string>>({});
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle');
    
  const queryClient = useQueryClient();

  // Initialize department from search params
  useEffect(() => {
    const dept = searchParams.get('department');
    if (dept) {
      setDepartment(dept.toUpperCase());
    }
  }, [searchParams]);

  // Fetch department inventory items (these have current stock in the selected department)
  const { data: deptInventoryItems = [], isLoading: isLoadingDeptInventory, error: deptInventoryError } = useQuery({
    queryKey: ['department-inventory', department],
    queryFn: async () => {
      const items = await DepartmentInventoryService.getDepartmentInventory(department);
      return items;
    },
    enabled: !!department,
  });

  // Show error if department inventory fails to load
  useEffect(() => {
    if (deptInventoryError) {
      console.error('Failed to load department inventory:', deptInventoryError);
      toast({
        title: "Failed to Load Inventory",
        description: "Unable to fetch department inventory items. Please try again.",
        variant: "destructive",
      });
    }
  }, [deptInventoryError]);

  // Filter department inventory items based on search
  const filteredItems = useMemo(() => {
    return (deptInventoryItems as DepartmentInventoryItem[]).filter((item) =>
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.categoryName && item.categoryName.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [deptInventoryItems, searchQuery]);

  const departments = ['KITCHEN', 'BAR', 'SERVICE', 'OPERATIONS', 'MANAGEMENT'];

  const handleQuantityChange = (itemId: number, value: string) => {
    setQuantities({ ...quantities, [itemId]: value });
    // Reset submit status when user makes changes
    if (submitStatus === 'error' || submitStatus === 'success') {
      setSubmitStatus('idle');
    }
  };

  // Create stock request mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log('Creating stock request with data:', JSON.stringify(data, null, 2));
      return StockRequestService.createStockRequest(data);
    },
    onSuccess: (response) => {
      console.log('Stock request created successfully:', response);
      setSubmitStatus('success');
      toast({
        title: "Stock Request Created",
        description: `Your stock request has been submitted successfully. Request ID: ${response.requestId}`,
      });
      queryClient.invalidateQueries({ queryKey: ['stock-requests'] });
      queryClient.invalidateQueries({ queryKey: ['department-inventory', department] });
      
      // Navigate back after a short delay to show success state
      setTimeout(() => {
        navigate(-1);
      }, 1500);
    },
    onError: (error: any) => {
      console.error('Failed to create stock request:', error);
      setSubmitStatus('error');
      toast({
        title: "Failed to Create Stock Request",
        description: error.response?.data?.message || error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    // Reset status
    setSubmitStatus('idle');

    // Filter items with quantities > 0
    const itemsWithQuantities = Object.entries(quantities)
      .filter(([_, value]) => {
        const qty = parseFloat(value);
        return !isNaN(qty) && qty > 0;
      })
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

    console.log('Submitting stock request...');
    setSubmitStatus('pending');
    createMutation.mutate(data);
  };

  // Check if any quantity has been entered
  const hasQuantities = Object.values(quantities).some(v => {
    const parsed = parseFloat(v);
    return !isNaN(parsed) && parsed > 0;
  });

  return (
    <MainLayout title="New Inventory Request">
      <div className="space-y-2">
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
                <Select
                  value={department}
                  onValueChange={(value) => {
                    setDepartment(value);
                    setQuantities({});
                  }}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept.charAt(0) + dept.slice(1).toLowerCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                {isLoadingDeptInventory ? (
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
                          onWheel={(e) => e.currentTarget.blur()}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Status Message */}
        {submitStatus === 'success' && (
          <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-green-700">Stock request submitted successfully! Redirecting...</span>
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
            <XCircle className="h-5 w-5 text-red-600" />
            <span className="text-red-700">Failed to submit stock request. Please try again.</span>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={createMutation.isPending || !hasQuantities || submitStatus === 'success'}
            className={submitStatus === 'success' ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : submitStatus === 'success' ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Submitted
              </>
            ) : (
              'Submit Request'
            )}
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}