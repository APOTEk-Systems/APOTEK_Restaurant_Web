import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Loader2, Edit, Trash2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

import { SupplierService, Supplier, CreateSupplierData, UpdateSupplierData } from "@/services/supplierService";
import { InventoryService, type InventoryCategory } from "@/services/inventoryService";

import { SupplierForm } from "@/components/suppliers/SupplierForm";

const statusStyles: Record<string, string> = {
  active: "bg-success/10 text-success border-success/20",
  inactive: "bg-muted text-muted-foreground border-border",
  pending: "bg-warning/10 text-warning border-warning/20",
};

// Helper function to get category name from inventoryCategories
const getCategoryName = (supplier: Supplier): string => {
  if (supplier.category) return supplier.category;
  if (supplier.inventoryCategories && supplier.inventoryCategories.length > 0) {
    return supplier.inventoryCategories[0].name;
  }
  return "Other";
};

export default function Suppliers() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const queryClient = useQueryClient();

  const [editForm, setEditForm] = useState({
    name: "",
    category: "",
    contact: "",
    phone: "",
    email: "",
    status: "ACTIVE"
  });

  // Fetch suppliers using React Query
  const { data: suppliers = [], isLoading, isError, error } = useQuery({
    queryKey: ["suppliers"],
    queryFn: SupplierService.getAllSuppliers,
  });

  // Fetch inventory categories dynamically
  const { data: categories = [] } = useQuery<InventoryCategory[]>({
    queryKey: ["inventoryCategories"],
    queryFn: InventoryService.getAllCategories,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateSupplierData) => SupplierService.createSupplier(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast.success("Supplier created successfully");
      setIsModalOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create supplier");
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateSupplierData }) =>
      SupplierService.updateSupplier(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast.success("Supplier updated successfully");
      setIsEditModalOpen(false);
      setEditingSupplier(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update supplier");
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => SupplierService.deleteSupplier(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast.success("Supplier deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete supplier");
    },
  });

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const openEditModal = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setEditForm({
      name: supplier.name || "",
      category: getCategoryName(supplier),
      contact: supplier.contactPerson || "",
      phone: supplier.phone || "",
      email: supplier.email || "",
      status: supplier.status || "ACTIVE"
    });
    setIsEditModalOpen(true);
  };

  // Filter suppliers based on search and category
  const filteredSuppliers = suppliers.filter((supplier: Supplier) => {
    const matchesSearch = supplier.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          supplier.contactPerson?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          supplier.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" ||
                            getCategoryName(supplier).toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <MainLayout title="Suppliers" subtitle="Manage your supplier relationships">
      <div className="space-y-6 animate-fade-in">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-3 w-full">
            <div className="relative flex-1 sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search suppliers..." 
                className="pl-9" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.name}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Add Supplier Dialog */}
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-primary-foreground shadow-glow hover:shadow-lg transition-shadow">
                <Plus className="h-4 w-4 mr-2" />
                Add Supplier
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">Add New Supplier</DialogTitle>
              </DialogHeader>
              <SupplierForm
                mode="create"
                categories={categories as InventoryCategory[]}
                isPending={createMutation.isPending}
                onSubmit={(data) => {
                  const categoryId = categories.find((c: InventoryCategory) => c.name === data.category)?.id;
                  createMutation.mutate({
                    name: data.name,
                    contactPerson: data.contact,
                    email: data.email,
                    phone: data.phone,
                    status: data.status,
                    categories: categoryId ? [categoryId] : undefined,
                  });
                }}
                onCancel={() => setIsModalOpen(false)}
              />
            </DialogContent>
          </Dialog>

          {/* Edit Supplier Dialog */}
          <Dialog open={isEditModalOpen} onOpenChange={(open) => {
            setIsEditModalOpen(open);
            if (!open) {
              setEditingSupplier(null);
            }
          }}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">Edit Supplier</DialogTitle>
              </DialogHeader>
              <SupplierForm
                mode="edit"
                initialData={editForm}
                categories={categories as InventoryCategory[]}
                isPending={updateMutation.isPending}
                onSubmit={(data) => {
                  if (!editingSupplier) return;
                  const categoryId = categories.find((c: InventoryCategory) => c.name === data.category)?.id;
                  updateMutation.mutate({
                    id: editingSupplier.id,
                    data: {
                      name: data.name,
                      contactPerson: data.contact,
                      email: data.email,
                      phone: data.phone,
                      status: data.status,
                      categories: categoryId ? [categoryId] : undefined,
                    }
                  });
                }}
                onCancel={() => setIsEditModalOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Error State */}
        {isError && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <p className="text-destructive">Failed to load suppliers: {error instanceof Error ? error.message : "Unknown error"}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Loading suppliers...</span>
          </div>
        ) : (
          /* Suppliers Table */
          <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
            {filteredSuppliers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No suppliers found. Add your first supplier to get started.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Supplier</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Email</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Phone</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredSuppliers.map((supplier: Supplier) => (
                      <tr key={supplier.id} className="hover:bg-muted/50 transition-colors">
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-medium">{supplier.name}</p>
                          </div>
                        </td>
                        
                        <td className="py-4 px-4">
                          <div>
                            <p className="text-sm text-muted-foreground truncate max-w-[200px]">{supplier.email || "-"}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm">{supplier.phone || "-"}</p>
                        </td>
                        <td className="py-4 px-4">
                          <Badge className={cn(statusStyles[supplier.status as keyof typeof statusStyles] || statusStyles.pending, "capitalize")}>
                            {supplier.status || "active"}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditModal(supplier)}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="bg-destructive text-white"
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Delete
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Supplier</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{supplier.name}"?
                                    This action cannot be undone and may affect associated purchase orders.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => supplier.id && handleDelete(supplier.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
