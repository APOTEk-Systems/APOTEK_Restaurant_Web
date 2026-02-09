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
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MenuService, type MenuItem, type MenuAddon, type MenuSideDish, type MenuCategory } from "@/services/menuService";
import { useToast } from "@/hooks/use-toast";
import { SideDishDialog } from "@/components/kitchen/SideDishDialog";
import { AddonDialog } from "@/components/kitchen/AddonDialog";
import { KitchenMenuCard } from "@/components/kitchen/KitchenMenuCard";
import { AddonCard } from "@/components/kitchen/AddonCard";
import { SideDishCard } from "@/components/kitchen/SideDishCard";

// Use the MenuItem type from the service with kitchen-specific category
interface KitchenMenuItem
  extends Omit<MenuItem, "categoryId" | "menuCategory"> {
  category: string; // Use string to support any category name
  orders?: number; // Optional field for display purposes
  categoryName?: string; // Store the actual category name
}

export default function KitchenMenu() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeTab, setActiveTab] = useState("items");
  const [sideDishDialogOpen, setSideDishDialogOpen] = useState(false);
  const [editingSideDish, setEditingSideDish] = useState<MenuSideDish | null>(null);
  const [addonDialogOpen, setAddonDialogOpen] = useState(false);
  const [editingAddon, setEditingAddon] = useState<MenuAddon | null>(null);
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

  // Availability toggling is handled inside each card component now.
  // Removed the empty/awkward `handleToggleAvailability` wrapper.
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
      // Navigate to MenuNew with the item ID for full editing
      navigate(`/menu/new?type=kitchen&id=${item.id}`);
    } else if (type === "addon") {
      // Open addon dialog for editing
      setEditingAddon(item as MenuAddon);
      setAddonDialogOpen(true);
    } else {
      // Open side dish dialog for editing
      setEditingSideDish(item as MenuSideDish);
      setSideDishDialogOpen(true);
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
                          item={item as any}
                          onEdit={(item: any) => handleEdit(item, "menu")}
                          onDelete={(id) => handleDelete(id, "menu")}
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
                    <Button 
                      className="gradient-primary text-primary-foreground shadow-glow hover:shadow-lg transition-shadow"
                      onClick={() => {
                        setEditingSideDish(null);
                        setSideDishDialogOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Side Dish
                    </Button>
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
                          sideDish={side as any}
                          onEdit={(sideDish) => handleEdit(sideDish as any, "side")}
                          onDelete={(id) => handleDelete(id, "side")}
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
                    <Button 
                      className="gradient-primary text-primary-foreground shadow-glow hover:shadow-lg transition-shadow"
                      onClick={() => {
                        setEditingAddon(null);
                        setAddonDialogOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Addon
                    </Button>
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
                          addon={addon as any}
                          onEdit={(addon) => handleEdit(addon as any, "addon")}
                          onDelete={(id) => handleDelete(id, "addon")}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>

      {/* Side Dish Dialog */}
      <SideDishDialog
        open={sideDishDialogOpen}
        onOpenChange={setSideDishDialogOpen}
        sideDish={editingSideDish}
      />

      {/* Addon Dialog */}
      <AddonDialog
        open={addonDialogOpen}
        onOpenChange={setAddonDialogOpen}
        addon={editingAddon}
      />
    </MainLayout>
  );
}