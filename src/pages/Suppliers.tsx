import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Eye, MoreHorizontal, Phone, Mail, Star, Loader2, AlertCircle, Edit, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SupplierService, Supplier, CreateSupplierData, UpdateSupplierData } from "@/services/supplierService";
import { InventoryService, type InventoryCategory } from "@/services/inventoryService";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const statusStyles: Record<string, string> = {
  active: "bg-success/10 text-success border-success/20",
  inactive: "bg-muted text-muted-foreground border-border",
  pending: "bg-warning/10 text-warning border-warning/20",
};

const categoryColors: Record<string, string> = {
  Produce: "bg-success/10 text-success",
  "Meat & Poultry": "bg-destructive/10 text-destructive",
  Seafood: "bg-primary/10 text-primary",
  Beverages: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  Dairy: "bg-warning/10 text-warning",
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

  const [newSupplier, setNewSupplier] = useState({
    name: "",
    category: "",
    contact: "",
    phone: "",
    email: "",
    status: "active"
  });

  const [editForm, setEditForm] = useState({
    name: "",
    category: "",
    contact: "",
    phone: "",
    email: "",
    status: "active"
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
      setNewSupplier({
        name: "",
        category: "",
        contact: "",
        phone: "",
        email: "",
        status: "active"
      });
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

  const handleInputChange = (field: string, value: string) => {
    setNewSupplier(prev => ({ ...prev, [field]: value }));
  };

  const handleEditInputChange = (field: string, value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const categoryId = categories.find((c: InventoryCategory) => c.name === newSupplier.category)?.id;
    
    createMutation.mutate({
      name: newSupplier.name,
      contactPerson: newSupplier.contact,
      email: newSupplier.email,
      phone: newSupplier.phone,
      status: newSupplier.status,
      categories: categoryId ? [categoryId] : undefined,
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingSupplier) return;
    
    const categoryId = categories.find((c: InventoryCategory) => c.name === editForm.category)?.id;
    
    updateMutation.mutate({
      id: editingSupplier.id,
      data: {
        name: editForm.name,
        contactPerson: editForm.contact,
        email: editForm.email,
        phone: editForm.phone,
        status: editForm.status,
        categories: categoryId ? [categoryId] : undefined,
      }
    });
  };

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
      status: supplier.status || "active"
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

  // Get unique categories from suppliers for filtering
  const uniqueCategoriesFromSuppliers = Array.from(new Set(suppliers.map((s: Supplier) => getCategoryName(s))));

  // Calculate stats
  const totalSuppliers = suppliers.length;
  const activeSuppliers = suppliers.filter((s: Supplier) => s.status === "active" || s.status === "active").length;
  const topRatedSuppliers = suppliers.filter((s: Supplier) => (s.rating || 0) >= 5).length;
  const categoryCount = uniqueCategoriesFromSuppliers.length;

  return (
    <MainLayout title="Suppliers" subtitle="Manage your supplier relationships">
      <div className="space-y-6 animate-fade-in">
        {/* Stats */}
        {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
            <p className="text-sm text-muted-foreground">Total Suppliers</p>
            <p className="text-2xl font-bold text-foreground mt-1">{isLoading ? "..." : totalSuppliers}</p>
            <p className="text-xs text-muted-foreground mt-1">Across all categories</p>
          </div>
          <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
            <p className="text-sm text-muted-foreground">Active</p>
            <p className="text-2xl font-bold text-success mt-1">{isLoading ? "..." : activeSuppliers}</p>
            <p className="text-xs text-muted-foreground mt-1">Currently trading</p>
          </div>
          <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
            <p className="text-sm text-muted-foreground">Top Rated</p>
            <p className="text-2xl font-bold text-warning mt-1">{isLoading ? "..." : topRatedSuppliers}</p>
            <p className="text-xs text-muted-foreground mt-1">5-star suppliers</p>
          </div>
          <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
            <p className="text-sm text-muted-foreground">Categories</p>
            <p className="text-2xl font-bold text-foreground mt-1">{isLoading ? "..." : categoryCount}</p>
            <p className="text-xs text-muted-foreground mt-1">Product categories</p>
          </div>
        </div> */}

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-3">
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
          <Dialog open={isModalOpen} onOpenChange={(open) => {
            setIsModalOpen(open);
            if (!open) {
              setNewSupplier({
                name: "",
                category: "",
                contact: "",
                phone: "",
                email: "",
                status: "active"
              });
            }
          }}>
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
              <form onSubmit={handleSubmit} className="space-y-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">
                      Supplier Name *
                    </Label>
                    <Input
                      id="name"
                      value={newSupplier.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="Enter supplier name"
                      required
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-sm font-medium">
                      Category *
                    </Label>
                    <Select
                      value={newSupplier.category}
                      onValueChange={(value) => handleInputChange("category", value)}
                      required
                    >
                      <SelectTrigger id="category" className="h-9">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat: InventoryCategory) => (
                          <SelectItem key={cat.id} value={cat.name}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact" className="text-sm font-medium">
                      Contact Person *
                    </Label>
                    <Input
                      id="contact"
                      value={newSupplier.contact}
                      onChange={(e) => handleInputChange("contact", e.target.value)}
                      placeholder="Enter contact name"
                      required
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium">
                      Phone *
                    </Label>
                    <Input
                      id="phone"
                      value={newSupplier.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="Enter phone number"
                      required
                      className="h-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={newSupplier.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="Enter email address"
                    required
                    className="h-9"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm font-medium">
                    Status
                  </Label>
                  <Select
                    value={newSupplier.status}
                    onValueChange={(value) => handleInputChange("status", value)}
                  >
                    <SelectTrigger id="status" className="h-9">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="gradient-primary text-primary-foreground shadow-glow hover:shadow-lg transition-shadow"
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Supplier"
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Edit Supplier Modal */}
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
              <form onSubmit={handleEditSubmit} className="space-y-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name" className="text-sm font-medium">
                      Supplier Name *
                    </Label>
                    <Input
                      id="edit-name"
                      value={editForm.name}
                      onChange={(e) => handleEditInputChange("name", e.target.value)}
                      placeholder="Enter supplier name"
                      required
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-category" className="text-sm font-medium">
                      Category *
                    </Label>
                    <Select
                      value={editForm.category}
                      onValueChange={(value) => handleEditInputChange("category", value)}
                      required
                    >
                      <SelectTrigger id="edit-category" className="h-9">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat: InventoryCategory) => (
                          <SelectItem key={cat.id} value={cat.name}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-contact" className="text-sm font-medium">
                      Contact Person *
                    </Label>
                    <Input
                      id="edit-contact"
                      value={editForm.contact}
                      onChange={(e) => handleEditInputChange("contact", e.target.value)}
                      placeholder="Enter contact name"
                      required
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-phone" className="text-sm font-medium">
                      Phone *
                    </Label>
                    <Input
                      id="edit-phone"
                      value={editForm.phone}
                      onChange={(e) => handleEditInputChange("phone", e.target.value)}
                      placeholder="Enter phone number"
                      required
                      className="h-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-email" className="text-sm font-medium">
                    Email *
                  </Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editForm.email}
                    onChange={(e) => handleEditInputChange("email", e.target.value)}
                    placeholder="Enter email address"
                    required
                    className="h-9"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-status" className="text-sm font-medium">
                    Status
                  </Label>
                  <Select
                    value={editForm.status}
                    onValueChange={(value) => handleEditInputChange("status", value)}
                  >
                    <SelectTrigger id="edit-status" className="h-9">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="gradient-primary text-primary-foreground shadow-glow hover:shadow-lg transition-shadow"
                    disabled={updateMutation.isPending}
                  >
                    {updateMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
              </form>
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
                      {/* <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Category</th> */}
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Contact</th>
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
                            <p className="text-sm text-muted-foreground">SUP-{String(supplier.id).padStart(3, '0')}</p>
                          </div>
                        </td>
                        
                        <td className="py-4 px-4">
                          <div>
                            <p className="text-sm">{supplier.contactPerson || "-"}</p>
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
                              Edit
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
