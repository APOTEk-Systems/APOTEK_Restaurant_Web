import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Eye, MoreHorizontal, Phone, Mail, MapPin, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const suppliers = [
  { id: "SUP-001", name: "Fresh Farms Co.", category: "Produce", contact: "Sarah Johnson", phone: "+1 555-0123", email: "orders@freshfarms.com", rating: 5, status: "active", totalOrders: 48 },
  { id: "SUP-002", name: "Premium Meats Inc.", category: "Meat & Poultry", contact: "Michael Brown", phone: "+1 555-0124", email: "supply@premiummeats.com", rating: 4, status: "active", totalOrders: 32 },
  { id: "SUP-003", name: "Seafood Direct", category: "Seafood", contact: "David Lee", phone: "+1 555-0125", email: "orders@seafooddirect.com", rating: 5, status: "active", totalOrders: 28 },
  { id: "SUP-004", name: "Wine & Spirits Dist.", category: "Beverages", contact: "Emma Wilson", phone: "+1 555-0126", email: "wholesale@winesp.com", rating: 4, status: "active", totalOrders: 24 },
  { id: "SUP-005", name: "Dairy Fresh", category: "Dairy", contact: "Tom Harris", phone: "+1 555-0127", email: "sales@dairyfresh.com", rating: 3, status: "inactive", totalOrders: 15 },
  { id: "SUP-006", name: "Organic Greens", category: "Produce", contact: "Lisa Chen", phone: "+1 555-0128", email: "orders@organicgreens.com", rating: 5, status: "active", totalOrders: 22 },
];

const statusStyles = {
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

export default function Suppliers() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSupplier, setNewSupplier] = useState({
    name: "",
    category: "",
    contact: "",
    phone: "",
    email: "",
    status: "active"
  });

  const handleInputChange = (field: string, value: string) => {
    setNewSupplier(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("New supplier:", newSupplier);
    // Here you would typically add the supplier to your data store
    setIsModalOpen(false);
    // Reset form
    setNewSupplier({
      name: "",
      category: "",
      contact: "",
      phone: "",
      email: "",
      status: "active"
    });
  };

  return (
    <MainLayout title="Suppliers" subtitle="Manage your supplier relationships">
      <div className="space-y-6 animate-fade-in">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
            <p className="text-sm text-muted-foreground">Total Suppliers</p>
            <p className="text-2xl font-bold text-foreground mt-1">24</p>
            <p className="text-xs text-muted-foreground mt-1">Across all categories</p>
          </div>
          <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
            <p className="text-sm text-muted-foreground">Active</p>
            <p className="text-2xl font-bold text-success mt-1">21</p>
            <p className="text-xs text-muted-foreground mt-1">Currently trading</p>
          </div>
          <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
            <p className="text-sm text-muted-foreground">Top Rated</p>
            <p className="text-2xl font-bold text-warning mt-1">8</p>
            <p className="text-xs text-muted-foreground mt-1">5-star suppliers</p>
          </div>
          <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
            <p className="text-sm text-muted-foreground">Categories</p>
            <p className="text-2xl font-bold text-foreground mt-1">6</p>
            <p className="text-xs text-muted-foreground mt-1">Product categories</p>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-3">
            <div className="relative flex-1 sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search suppliers..." className="pl-9" />
            </div>
            <Select defaultValue="all">
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
                  >
                    Create Supplier
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Suppliers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliers.map((supplier) => (
            <div key={supplier.id} className="bg-card rounded-xl p-5 shadow-card border border-border/50 hover:shadow-lg transition-all">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-foreground">{supplier.name}</h3>
                  <p className="text-sm text-muted-foreground">{supplier.id}</p>
                </div>
                <Badge className={cn(statusStyles[supplier.status as keyof typeof statusStyles], "capitalize")}>
                  {supplier.status}
                </Badge>
              </div>

              <div className="space-y-3 mb-4">
                <Badge className={cn("text-xs", categoryColors[supplier.category])}>
                  {supplier.category}
                </Badge>
                
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={cn(
                        "h-4 w-4",
                        i < supplier.rating ? "fill-warning text-warning" : "text-muted"
                      )} 
                    />
                  ))}
                  <span className="text-sm text-muted-foreground ml-2">({supplier.totalOrders} orders)</span>
                </div>

                <div className="pt-2 space-y-2 text-sm">
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
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
