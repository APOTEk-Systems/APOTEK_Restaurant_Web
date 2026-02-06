import { Dispatch, SetStateAction } from "react";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Utensils, PlusCircle, GlassWater, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { MenuService, type MenuCategory, type MenuAddon, type MenuSideDish } from "@/services/menuService";
import { AddonDialog } from "./AddonDialog";
import { SideDishDialog } from "./SideDishDialog";

interface KitchenMenuFiltersProps {
  onAddItem: () => void;
  showAddonDialog: boolean;
  setShowAddonDialog: Dispatch<SetStateAction<boolean>>;
  showSideDishDialog: boolean;
  setShowSideDishDialog: Dispatch<SetStateAction<boolean>>;
  editingAddon: MenuAddon | null;
  setEditingAddon: Dispatch<SetStateAction<MenuAddon | null>>;
  editingSideDish: MenuSideDish | null;
  setEditingSideDish: Dispatch<SetStateAction<MenuSideDish | null>>;
}

export function KitchenMenuFilters({
  onAddItem,
  showAddonDialog,
  setShowAddonDialog,
  showSideDishDialog,
  setShowSideDishDialog,
  editingAddon,
  setEditingAddon,
  editingSideDish,
  setEditingSideDish,
}: KitchenMenuFiltersProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const searchQuery = searchParams.get("search") || "";
  const selectedCategory = searchParams.get("category") || "all";
  const activeTab = searchParams.get("tab") || "items";

  // Fetch categories
  const { data: categories = [] } = useQuery<MenuCategory[]>({
    queryKey: ['menuCategories'],
    queryFn: MenuService.getAllMenuCategories,
  });

  const updateSearch = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set("search", value);
    else params.delete("search");
    setSearchParams(params);
  };

  const updateCategory = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== "all") params.set("category", value);
    else params.delete("category");
    setSearchParams(params);
  };

  const updateTab = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("tab", value);
    setSearchParams(params);
  };

  return (
    <>
      <Tabs value={activeTab} onValueChange={updateTab} className="w-full">
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

        <TabsContent value="items">
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              <div className="relative flex-1 min-w-[250px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search menu items..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => updateSearch(e.target.value)}
                />
              </div>
              <div className="min-w-[200px]">
                <Select value={selectedCategory} onValueChange={updateCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories
                      .filter((category) => category.prepArea === "KITCHEN")
                      .map((category) => (
                        <SelectItem key={category.id} value={category.name.toLowerCase()}>
                          {category.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={onAddItem} className="gradient-primary text-primary-foreground shadow-glow hover:shadow-lg transition-shadow">
              <Plus className="h-4 w-4 mr-2" />
              Add Kitchen Item
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="sides">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative flex-1 sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search side dishes..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => updateSearch(e.target.value)}
              />
            </div>
            <Button onClick={() => setShowSideDishDialog(true)} className="gradient-primary text-primary-foreground shadow-glow hover:shadow-lg transition-shadow">
              <Plus className="h-4 w-4 mr-2" />
              Add Side Dish
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="addons">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative flex-1 sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search addons..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => updateSearch(e.target.value)}
              />
            </div>
            <Button onClick={() => setShowAddonDialog(true)} className="gradient-primary text-primary-foreground shadow-glow hover:shadow-lg transition-shadow">
              <Plus className="h-4 w-4 mr-2" />
              Add Addon
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      <AddonDialog
        open={showAddonDialog}
        onOpenChange={setShowAddonDialog}
        addon={editingAddon}
      />
      <SideDishDialog
        open={showSideDishDialog}
        onOpenChange={setShowSideDishDialog}
        sideDish={editingSideDish}
      />
    </>
  );
}