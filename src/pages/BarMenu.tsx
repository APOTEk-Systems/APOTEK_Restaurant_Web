import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Edit, Trash2, Star, ToggleLeft, ToggleRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MenuService, type MenuItem, type MenuAddon, type MenuSideDish, type MenuCategory } from "@/services/menuService";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Use the MenuItem type from the service with bar-specific category
interface BarMenuItem
  extends Omit<MenuItem, "categoryId" | "menuCategory"> {
  category: string;
  orders?: number;
  categoryName?: string;
}

function BarMenuCard({
  item,
  onToggleAvailability,
  onEdit,
  onDelete,
  isToggling,
}: {
  item: BarMenuItem;
  onToggleAvailability: (id: number, currentStatus: boolean) => void;
  onEdit: (item: BarMenuItem) => void;
  onDelete: (id: number) => void;
  isToggling?: boolean;
}) {
  return (
    <div
      className={cn(
        "bg-card rounded-xl p-5 shadow-card border border-border/50 hover:shadow-card-hover transition-all duration-300 hover-lift",
        !item.isAvailable && "opacity-60"
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">{item.name}</h3>
            {!item.isAvailable && (
              <Badge variant="secondary" className="text-xs">
                Unavailable
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {item.description}
          </p>
          {item.categoryName && (
            <Badge variant="outline" className="mt-2 text-xs">
              {item.categoryName}
            </Badge>
          )}
        </div>
        <span className="text-lg font-bold text-primary">
          ${item.price.toLocaleString("en-US")}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {item.rating && (
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 text-warning fill-warning" />
              {item.rating}
            </span>
          )}
          {item.orders && <span>{item.orders} orders</span>}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onEdit(item)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Menu Item</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{item.name}"? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(item.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onToggleAvailability(item.id, item.isAvailable)}
            disabled={isToggling}
          >
            {isToggling ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : item.isAvailable ? (
              <ToggleRight className="h-4 w-4 text-success" />
            ) : (
              <ToggleLeft className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function BarMenu() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [editingItem, setEditingItem] = useState<BarMenuItem | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch all required data using React Query
  const {
    data: menuItemsData,
    isLoading: isLoadingMenuItems,
    error: menuItemsError
  } = useQuery<MenuItem[], Error>({
    queryKey: ['menuItems'],
    queryFn: MenuService.getAllMenuItems,
  });

  const {
    data: categoriesData,
    isLoading: isLoadingCategories,
    error: categoriesError
  } = useQuery<MenuCategory[], Error>({
    queryKey: ['menuCategories'],
    queryFn: MenuService.getAllMenuCategories,
  });

  // Check if any data is still loading
  const isLoading = isLoadingMenuItems || isLoadingCategories;

  // Check if any error occurred
  const error = menuItemsError || categoriesError;

  // Mutations
  const toggleMenuItemMutation = useMutation({
    mutationFn: ({ id, isAvailable }: { id: number; isAvailable: boolean }) =>
      MenuService.toggleMenuItemAvailability(id, !isAvailable),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      toast({
        title: "Success",
        description: "Menu item availability updated",
      });
      setTogglingId(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update availability",
        variant: "destructive",
      });
      setTogglingId(null);
    },
  });

  const deleteMenuItemMutation = useMutation({
    mutationFn: (id: number) => MenuService.deleteMenuItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      toast({
        title: "Success",
        description: "Menu item deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete menu item",
        variant: "destructive",
      });
    },
  });

  // Process menu items with category mapping (filter for BAR only)
  const barMenuItems: BarMenuItem[] = useMemo(() => {
    if (!menuItemsData || !categoriesData) return [];

    return menuItemsData
      .filter((item) => item.prepArea === "BAR")
      .map((item) => {
        const category = categoriesData.find(
          (cat) => cat.id === item.categoryId
        );
        const categoryName = category ? category.name : "Uncategorized";
        return {
          ...item,
          category: categoryName,
          categoryName: categoryName,
        };
      });
  }, [menuItemsData, categoriesData]);

  // Use data directly from React Query
  const categories = categoriesData || [];

  // Show error toast when any error occurs
  if (error) {
    console.error("Error fetching menu data:", error);
    toast({
      title: "Error",
      description: "Failed to load bar menu data",
      variant: "destructive",
    });
  }

  const handleToggleAvailability = (id: number, currentStatus: boolean) => {
    setTogglingId(id);
    toggleMenuItemMutation.mutate({ id, isAvailable: currentStatus });
  };

  const handleDelete = (id: number) => {
    deleteMenuItemMutation.mutate(id);
  };

  const handleEdit = (item: BarMenuItem) => {
    setEditingItem(item);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (editingItem) {
      MenuService.updateMenuItem(editingItem.id, {
        name: editingItem.name,
        description: editingItem.description,
        price: editingItem.price,
      }).then(() => {
        queryClient.invalidateQueries({ queryKey: ['menuItems'] });
        setIsEditDialogOpen(false);
        setEditingItem(null);
        toast({
          title: "Success",
          description: "Menu item updated successfully",
        });
      }).catch((error: Error) => {
        toast({
          title: "Error",
          description: error.message || "Failed to update menu item",
          variant: "destructive",
        });
      });
    }
  };

  // Filter menu items based on search and category
  const filteredMenuItems = barMenuItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      activeTab === "all" ||
      item.category.toLowerCase() === activeTab;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories from bar menu items
  const barCategories = [...new Set(barMenuItems.map((item) => item.category))];

  return (
    <MainLayout
      title="Bar Menu"
      subtitle="Manage bar menu items and availability"
    >
      <div className="space-y-6 animate-fade-in">
        {/* Loading and Error States */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <span className="ml-4 text-lg">Loading bar menu...</span>
          </div>
        ) : error ? (
          <div className="p-6 rounded-lg bg-red-50 border border-red-200 text-red-800">
            <p className="font-medium">Error loading menu</p>
            <p className="mt-2">{error?.message || "An error occurred"}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        ) : (
          <>
            {/* Actions Bar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="relative flex-1 sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search bar menu items..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Link to="/menu/new?type=bar">
                <Button className="gradient-primary text-primary-foreground shadow-glow hover:shadow-lg transition-shadow">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Bar Item
                </Button>
              </Link>
            </div>

            {/* Menu Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              {/* <TabsList className="bg-muted/50 p-1">
                <TabsTrigger value="all">All Items</TabsTrigger>
                {barCategories.map((category) => (
                  <TabsTrigger key={category} value={category.toLowerCase()}>
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList> */}

              <TabsContent value={activeTab} className="mt-6">
                {filteredMenuItems.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p className="mb-4">No bar menu items found</p>
                    {searchQuery && (
                      <p>Try adjusting your search</p>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredMenuItems.map((item) => (
                      <BarMenuCard
                        key={item.id}
                        item={item}
                        onToggleAvailability={(id, status) =>
                          handleToggleAvailability(id, status)
                        }
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        isToggling={togglingId === item.id}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? "Edit Bar Item" : "Edit"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {editingItem && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Name</Label>
                    <Input
                      id="edit-name"
                      value={editingItem.name}
                      onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-description">Description</Label>
                    <Input
                      id="edit-description"
                      value={editingItem.description}
                      onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-price">Price</Label>
                    <Input
                      id="edit-price"
                      type="number"
                      value={editingItem.price}
                      onChange={(e) => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) })}
                    />
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsEditDialogOpen(false);
                setEditingItem(null);
              }}>
                Cancel
              </Button>
              <Button
                type="submit"
                onClick={handleSaveEdit}
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
