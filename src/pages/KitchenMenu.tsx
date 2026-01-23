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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, useSearchParams } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { MenuService } from "@/services/menuService";
import { MenuItem, MenuAddon, MenuSideDish, MenuCategory } from "@/services/menuService";
import { useToast } from "@/hooks/use-toast";

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
}: {
  item: KitchenMenuItem;
  onToggleAvailability: (id: number) => void;
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
          {item.price.toLocaleString("en-US")}
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
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onToggleAvailability(item.id)}
          >
            {item.isAvailable ? (
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
}: {
  addon: MenuAddon;
  onToggleAvailability: (id: number) => void;
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
          {addon.price.toLocaleString("en-US")}
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
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onToggleAvailability(addon.id)}
          >
            {addon.isAvailable ? (
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
}: {
  sideDish: MenuSideDish;
  onToggleAvailability: (id: number) => void;
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
          {sideDish.price.toLocaleString("en-US")}
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
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onToggleAvailability(sideDish.id)}
          >
            {sideDish.isAvailable ? (
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

  const toggleAvailability = (id: number, type: "menu" | "addon" | "side") => {
    // TODO: Implement API call to toggle availability
    console.log(`Toggle availability for ${type} with id ${id}`);
    toast({
      title: "Feature Coming Soon",
      description: "Toggle availability will be implemented with backend integration",
      variant: "default"
    });
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
            {/* Main Tabs Navigation */}
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
                          onToggleAvailability={(id) =>
                            toggleAvailability(id, "menu")
                          }
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
                          onToggleAvailability={(id) =>
                            toggleAvailability(id, "side")
                          }
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
                          onToggleAvailability={(id) =>
                            toggleAvailability(id, "addon")
                          }
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
    </MainLayout>
  );
}
