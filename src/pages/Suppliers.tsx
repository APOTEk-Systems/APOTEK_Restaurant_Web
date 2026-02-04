import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Eye, MoreHorizontal, Phone, Mail, Star, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SupplierService, Supplier } from "@/services/supplierService";

const statusStyles: Record<string, string> = {
  active: "bg-success/10 text-success border-success/20",
  inactive: "bg-muted text-muted-foreground border-border",
  pending: "bg-warning/10 text-warning border-warning/20",
};

const categoryColors: Record<string, string> = {
  "Produce": "bg-success/10 text-success",
  "Meat & Poultry": "bg-destructive/10 text-destructive",
  "Seafood": "bg-primary/10 text-primary",
  "Beverages": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  "Dairy": "bg-warning/10 text-warning",
};

// Helper function to get category name from inventoryCategories
const getCategoryName = (supplier: Supplier): string => {
  if (supplier.category) return supplier.category;
  if (supplier.inventoryCategories && supplier.inventoryCategories.length > 0) {
    return supplier.inventoryCategories[0].name;
  }
  return "Other";
};

// Category name to ID mapping (you may need to adjust based on your inventory categories)
const categoryMapping: Record<string, number> = {
  "Produce": 1,
  "Meat & Poultry": 2,
  "Seafood": 3,
  "Beverages": 4,
  "Dairy": 5,
  "Other": 6,
};

export default function Suppliers() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const [newSupplier, setNewSupplier] = useState({
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

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: { name: string; contact: string; email: string; phone: string; status: string; categories?: number[] }) =>
      SupplierService.createSupplier({
        name: data.name,
        contactPerson: data.contact,
        email: data.email,
        phone: data.phone,
        categories: data.categories,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
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
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => SupplierService.deleteSupplier(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      setDeletingId(null);
    },
  });

  const handleInputChange = (field: string, value: string) => {
    setNewSupplier(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Map category name to category ID if needed
    const categoryId = categoryMapping[newSupplier.category];
    
    createMutation.mutate({
      name: newSupplier.name,
      contact: newSupplier.contact,
      email: newSupplier.email,
      phone: newSupplier.phone,
      status: newSupplier.status,
      categories: categoryId ? [categoryId] : undefined,
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this supplier?")) {
      setDeletingId(id);
      deleteMutation.mutate(id);
    }
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

  // Calculate stats
  const totalSuppliers = suppliers.length;
  const activeSuppliers = suppliers.filter((s: Supplier) => s.status === "active" || s.status === "active").length;
  const topRatedSuppliers = suppliers.filter((s: Supplier) => (s.rating || 0) >= 5).length;
  const categories = new Set(suppliers.map((s: Supplier) => getCategoryName(s)));

  return (
    <MainLayout title="Suppliers" subtitle="Manage your supplier relationships">
      <div className="space-y-6 animate-fade-in">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <p className="text-2xl font-bold text-foreground mt-1">{isLoading ? "..." : categories.size}</p>
            <p className="text-xs text-muted-foreground mt-1">Product categories</p>
          </div>
        </div>

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
                <SelectItem value="produce">Produce</SelectItem>
                <SelectItem value="meat">Meat & Poultry</SelectItem>
                <SelectItem value="seafood">Seafood</SelectItem>
                <SelectItem value="beverages">Beverages</SelectItem>
                <SelectItem value="dairy">Dairy</SelectItem>
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
                        <SelectItem value="Produce">Produce</SelectItem>
                        <SelectItem value="Meat & Poultry">Meat & Poultry</SelectItem>
                        <SelectItem value="Seafood">Seafood</SelectItem>
                        <SelectItem value="Beverages">Beverages</SelectItem>
                        <SelectItem value="Dairy">Dairy</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
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
          /* Suppliers Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSuppliers.length === 0 ? (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                No suppliers found. Add your first supplier to get started.
              </div>
            ) : (
              filteredSuppliers.map((supplier: Supplier) => (
                <div key={supplier.id} className="bg-card rounded-xl p-5 shadow-card border border-border/50 hover:shadow-lg transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-foreground">{supplier.name}</h3>
                      <p className="text-sm text-muted-foreground">SUP-{String(supplier.id).padStart(3, '0')}</p>
                    </div>
                    <Badge className={cn(statusStyles[supplier.status as keyof typeof statusStyles] || statusStyles.pending, "capitalize")}>
                      {supplier.status || "active"}
                    </Badge>
                  </div>

                  <div className="space-y-3 mb-4">
                    <Badge className={cn("text-xs", categoryColors[getCategoryName(supplier)] || categoryColors["Other"])}>
                      {getCategoryName(supplier)}
                    </Badge>
                    
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={cn(
                            "h-4 w-4",
                            i < (supplier.rating || 0) ? "fill-warning text-warning" : "text-muted"
                          )} 
                        />
                      ))}
                      <span className="text-sm text-muted-foreground ml-2">({supplier.totalOrders || 0} orders)</span>
                    </div>

                    <div className="pt-2 space-y-2 text-sm">
                      {supplier.contactPerson && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <span className="font-medium">{supplier.contactPerson}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{supplier.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span className="truncate">{supplier.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-border">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => supplier.id && handleDelete(supplier.id)}
                      disabled={deletingId === supplier.id}
                    >
                      {deletingId === supplier.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <MoreHorizontal className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
