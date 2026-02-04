import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Star,
  ToggleLeft,
  ToggleRight,
  Utensils,
  GlassWater,
  PlusCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, useSearchParams } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
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

// Use the MenuItem type from the service with kitchen-specific category
interface KitchenMenuItem
  extends Omit<MenuItem, "categoryId" | "menuCategory"> {
  category: string; // Use string to support any category name
  orders?: number; // Optional field for display purposes
  categoryName?: string; // Store the actual category name
}

function KitchenMenuCard({
  item,
  onToggleAvailability,
  onEdit,
  onDelete,
  isToggling,
}: {
  item: KitchenMenuItem;
  onToggleAvailability: (id: number, currentStatus: boolean) => void;
  onEdit: (item: KitchenMenuItem) => void;
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

function AddonCard({
  addon,
  onToggleAvailability,
  onEdit,
  onDelete,
  isToggling,
}: {
  addon: MenuAddon;
  onToggleAvailability: (id: number, currentStatus: boolean) => void;
  onEdit: (addon: MenuAddon) => void;
  onDelete: (id: number) => void;
  isToggling?: boolean;
}) {
  return (
    <div
      className={cn(
        "bg-card rounded-xl p-5 shadow-card border border-border/50 hover:shadow-card-hover transition-all duration-300 hover-lift",
        !addon.isAvailable && "opacity-60"
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">{addon.name}</h3>
            {!addon.isAvailable && (
              <Badge variant="secondary" className="text-xs">
                Unavailable
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {addon.description}
          </p>
        </div>
        <span className="text-lg font-bold text-primary">
          ${addon.price.toLocaleString("en-US")}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {addon.isAvailable && (
            <Badge variant="outline" className="text-xs">
              Available as addon
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onEdit(addon)}
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
                <AlertDialogTitle>Delete Addon</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{addon.name}"? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(addon.id)}
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
            onClick={() => onToggleAvailability(addon.id, addon.isAvailable)}
            disabled={isToggling}
          >
            {isToggling ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : addon.isAvailable ? (
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

function SideDishCard({
  sideDish,
  onToggleAvailability,
  onEdit,
  onDelete,
  isToggling,
}: {
  sideDish: MenuSideDish;
  onToggleAvailability: (id: number, currentStatus: boolean) => void;
  onEdit: (sideDish: MenuSideDish) => void;
  onDelete: (id: number) => void;
  isToggling?: boolean;
}) {
  return (
    <div
      className={cn(
        "bg-card rounded-xl p-5 shadow-card border border-border/50 hover:shadow-card-hover transition-all duration-300 hover-lift",
        !sideDish.isAvailable && "opacity-60"
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">{sideDish.name}</h3>
            {!sideDish.isAvailable && (
              <Badge variant="secondary" className="text-xs">
                Unavailable
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {sideDish.description}
          </p>
        </div>
        <span className="text-lg font-bold text-primary">
          ${sideDish.price.toLocaleString("en-US")}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {sideDish.isAvailable && (
            <Badge variant="outline" className="text-xs">
              Available as side
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onEdit(sideDish)}
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
                <AlertDialogTitle>Delete Side Dish</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{sideDish.name}"? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(sideDish.id)}
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
            onClick={() => onToggleAvailability(sideDish.id, sideDish.isAvailable)}
            disabled={isToggling}
          >
            {isToggling ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : sideDish.isAvailable ? (
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

export default function KitchenMenu() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("items");
  const [editingItem, setEditingItem] = useState<KitchenMenuItem | null>(null);
  const [editingAddon, setEditingAddon] = useState<MenuAddon | null>(null);
  const [editingSideDish, setEditingSideDish] = useState<MenuSideDish | null>(null);
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
    data: addonsData,
    isLoading: isLoadingAddons,
    error: addonsError
  } = useQuery<MenuAddon[], Error>({
    queryKey: ['menuAddons'],
    queryFn: MenuService.getAllMenuAddons,
  });

  const {
    data: sideDishesData,
    isLoading: isLoadingSideDishes,
    error: sideDishesError
  } = useQuery<MenuSideDish[], Error>({
    queryKey: ['menuSideDishes'],
    queryFn: MenuService.getAllMenuSideDishes,
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
  const isLoading = isLoadingMenuItems || isLoadingAddons || isLoadingSideDishes || isLoadingCategories;

  // Check if any error occurred
  const error = menuItemsError || addonsError || sideDishesError || categoriesError;

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

  const toggleAddonMutation = useMutation({
    mutationFn: ({ id, isAvailable }: { id: number; isAvailable: boolean }) =>
      MenuService.toggleAddonAvailability(id, !isAvailable),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuAddons'] });
      toast({
        title: "Success",
        description: "Addon availability updated",
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

  const toggleSideDishMutation = useMutation({
    mutationFn: ({ id, isAvailable }: { id: number; isAvailable: boolean }) =>
      MenuService.toggleSideDishAvailability(id, !isAvailable),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuSideDishes'] });
      toast({
        title: "Success",
        description: "Side dish availability updated",
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

  const deleteAddonMutation = useMutation({
    mutationFn: (id: number) => MenuService.deleteMenuAddon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuAddons'] });
      toast({
        title: "Success",
        description: "Addon deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete addon",
        variant: "destructive",
      });
    },
  });

  const deleteSideDishMutation = useMutation({
    mutationFn: (id: number) => MenuService.deleteMenuSideDish(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuSideDishes'] });
      toast({
        title: "Success",
        description: "Side dish deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete side dish",
        variant: "destructive",
      });
    },
  });

  // Process menu items with category mapping
  const menuItems: KitchenMenuItem[] = useMemo(() => {
    if (!menuItemsData || !categoriesData) return [];

    return menuItemsData
      .filter((item) => item.prepArea === "KITCHEN")
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
  const addons = addonsData || [];
  const sideDishes = sideDishesData || [];
  const categories = categoriesData || [];

  // Show error toast when any error occurs
  useEffect(() => {
    if (error) {
      console.error("Error fetching menu data:", error);
      toast({
        title: "Error",
        description: "Failed to load kitchen menu data",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const handleToggleAvailability = (id: number, currentStatus: boolean, type: "menu" | "addon" | "side") => {
    setTogglingId(id);
    if (type === "menu") {
      toggleMenuItemMutation.mutate({ id, isAvailable: currentStatus });
    } else if (type === "addon") {
      toggleAddonMutation.mutate({ id, isAvailable: currentStatus });
    } else {
      toggleSideDishMutation.mutate({ id, isAvailable: currentStatus });
    }
  };

  const handleDelete = (id: number, type: "menu" | "addon" | "side") => {
    if (type === "menu") {
      deleteMenuItemMutation.mutate(id);
    } else if (type === "addon") {
      deleteAddonMutation.mutate(id);
    } else {
      deleteSideDishMutation.mutate(id);
    }
  };

  const handleEdit = (item: KitchenMenuItem | MenuAddon | MenuSideDish, type: "menu" | "addon" | "side") => {
    if (type === "menu") {
      setEditingItem(item as KitchenMenuItem);
    } else if (type === "addon") {
      setEditingAddon(item as MenuAddon);
    } else {
      setEditingSideDish(item as MenuSideDish);
    }
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
    } else if (editingAddon) {
      MenuService.updateMenuAddon(editingAddon.id, {
        name: editingAddon.name,
        description: editingAddon.description || undefined,
        price: editingAddon.price,
      }).then(() => {
        queryClient.invalidateQueries({ queryKey: ['menuAddons'] });
        setIsEditDialogOpen(false);
        setEditingAddon(null);
        toast({
          title: "Success",
          description: "Addon updated successfully",
        });
      }).catch((error: Error) => {
        toast({
          title: "Error",
          description: error.message || "Failed to update addon",
          variant: "destructive",
        });
      });
    } else if (editingSideDish) {
      MenuService.updateMenuSideDish(editingSideDish.id, {
        name: editingSideDish.name,
        description: editingSideDish.description || undefined,
        price: editingSideDish.price,
      }).then(() => {
        queryClient.invalidateQueries({ queryKey: ['menuSideDishes'] });
        setIsEditDialogOpen(false);
        setEditingSideDish(null);
        toast({
          title: "Success",
          description: "Side dish updated successfully",
        });
      }).catch((error: Error) => {
        toast({
          title: "Error",
          description: error.message || "Failed to update side dish",
          variant: "destructive",
        });
      });
    }
  };

  // Filter menu items based on search and category
  const filteredMenuItems = menuItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" ||
      item.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  // Filter addons based on search
  const filteredAddons = addons.filter(
    (addon) =>
      addon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      addon.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter side dishes based on search
  const filteredSideDishes = sideDishes.filter(
    (side) =>
      side.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      side.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout
      title="Kitchen Management"
      subtitle="Manage menu items, sides, and addons"
    >
      <div className="space-y-6 animate-fade-in">
        {/* Loading and Error States */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <span className="ml-4 text-lg">Loading kitchen management...</span>
          </div>
        ) : error ? (
          <div className="p-6 rounded-lg bg-red-50 border border-red-200 text-red-800">
            <p className="font-medium">❌ Error loading menu</p>
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
            {/* Main Tabs Navigationss */}
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="bg-muted/50 p-1 mb-6 flex">
                <TabsTrigger value="items" className="flex-1">
                  <Utensils className="h-4 w-4 mr-2" /> Menu Items
                </TabsTrigger>
                <TabsTrigger value="sides" className="flex-1">
                  <PlusCircle className="h-4 w-4 mr-2" /> Side Dishes
                </TabsTrigger>
                <TabsTrigger value="addons" className="flex-1">
                  <GlassWater className="h-4 w-4 mr-2" /> Addons
                </TabsTrigger>
              </TabsList>

              {/* Items Tab - Menu Items Management */}
              <TabsContent value="items">
                <div className="space-y-6">
                  {/* Search and Filter Controls */}
                  <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
                    <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                      <div className="relative flex-1 min-w-[250px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search menu items..."
                          className="pl-9"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      <div className="min-w-[200px]">
                        <Select
                          value={selectedCategory}
                          onValueChange={setSelectedCategory}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Filter by category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories
                              .filter(
                                (category) => category.prepArea === "KITCHEN"
                              )
                              .map((category) => (
                                <SelectItem
                                  key={category.id}
                                  value={category.name.toLowerCase()}
                                >
                                  {category.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Link to="/menu/new?type=kitchen">
                      <Button className="gradient-primary text-primary-foreground shadow-glow hover:shadow-lg transition-shadow">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Kitchen Item
                      </Button>
                    </Link>
                  </div>

                  {/* Menu Items Grid */}
                  {filteredMenuItems.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <p className="mb-4">No menu items found</p>
                      {searchQuery && (
                        <p>Try adjusting your search or filters</p>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredMenuItems.map((item) => (
                        <KitchenMenuCard
                          key={item.id}
                          item={item}
                          onToggleAvailability={(id, status) =>
                            handleToggleAvailability(id, status, "menu")
                          }
                          onEdit={(item) => handleEdit(item, "menu")}
                          onDelete={(id) => handleDelete(id, "menu")}
                          isToggling={togglingId === item.id}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Sides Tab - Side Dishes Management */}
              <TabsContent value="sides">
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row gap-4 justify-between">
                    <div className="relative flex-1 sm:w-80">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search side dishes..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Link to="/menu/side-dishes/new">
                      <Button className="gradient-primary text-primary-foreground shadow-glow hover:shadow-lg transition-shadow">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Side Dish
                      </Button>
                    </Link>
                  </div>

                  {filteredSideDishes.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <p className="mb-4">No side dishes found</p>
                      {searchQuery && <p>Try adjusting your search</p>}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredSideDishes.map((side) => (
                        <SideDishCard
                          key={side.id}
                          sideDish={side}
                          onToggleAvailability={(id, status) =>
                            handleToggleAvailability(id, status, "side")
                          }
                          onEdit={(sideDish) => handleEdit(sideDish, "side")}
                          onDelete={(id) => handleDelete(id, "side")}
                          isToggling={togglingId === side.id}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Addons Tab - Addons Management */}
              <TabsContent value="addons">
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row gap-4 justify-between">
                    <div className="relative flex-1 sm:w-80">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search addons..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Link to="/menu/addons/new">
                      <Button className="gradient-primary text-primary-foreground shadow-glow hover:shadow-lg transition-shadow">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Addon
                      </Button>
                    </Link>
                  </div>

                  {filteredAddons.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <p className="mb-4">No addons found</p>
                      {searchQuery && <p>Try adjusting your search</p>}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredAddons.map((addon) => (
                        <AddonCard
                          key={addon.id}
                          addon={addon}
                          onToggleAvailability={(id, status) =>
                            handleToggleAvailability(id, status, "addon")
                          }
                          onEdit={(addon) => handleEdit(addon, "addon")}
                          onDelete={(id) => handleDelete(id, "addon")}
                          isToggling={togglingId === addon.id}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? "Edit Menu Item" : editingAddon ? "Edit Addon" : editingSideDish ? "Edit Side Dish" : "Edit"}
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
              {editingAddon && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Name</Label>
                    <Input
                      id="edit-name"
                      value={editingAddon.name}
                      onChange={(e) => setEditingAddon({ ...editingAddon, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-description">Description</Label>
                    <Input
                      id="edit-description"
                      value={editingAddon.description || ""}
                      onChange={(e) => setEditingAddon({ ...editingAddon, description: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-price">Price</Label>
                    <Input
                      id="edit-price"
                      type="number"
                      value={editingAddon.price}
                      onChange={(e) => setEditingAddon({ ...editingAddon, price: parseFloat(e.target.value) })}
                    />
                  </div>
                </>
              )}
              {editingSideDish && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Name</Label>
                    <Input
                      id="edit-name"
                      value={editingSideDish.name}
                      onChange={(e) => setEditingSideDish({ ...editingSideDish, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-description">Description</Label>
                    <Input
                      id="edit-description"
                      value={editingSideDish.description || ""}
                      onChange={(e) => setEditingSideDish({ ...editingSideDish, description: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-price">Price</Label>
                    <Input
                      id="edit-price"
                      type="number"
                      value={editingSideDish.price}
                      onChange={(e) => setEditingSideDish({ ...editingSideDish, price: parseFloat(e.target.value) })}
                    />
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsEditDialogOpen(false);
                setEditingItem(null);
                setEditingAddon(null);
                setEditingSideDish(null);
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
