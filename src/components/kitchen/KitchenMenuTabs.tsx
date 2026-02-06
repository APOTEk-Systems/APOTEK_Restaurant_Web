import { useSearchParams } from "react-router-dom";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MenuCard } from "@/components/menu/MenuCard";
import { MenuService, type MenuItem, type MenuAddon, type MenuSideDish, type MenuCategory } from "@/services/menuService";
import { KitchenMenuLoading } from "./KitchenMenuLoading";
import { useToast } from "@/hooks/use-toast";

// Kitchen-specific menu item type
interface KitchenMenuItem extends Omit<MenuItem, "categoryId" | "menuCategory"> {
  category: string;
  orders?: number;
  categoryName?: string;
}

interface KitchenMenuTabsProps {
  onEditMenu: (item: KitchenMenuItem) => void;
  onEditAddon: (addon: MenuAddon) => void;
  onEditSideDish: (sideDish: MenuSideDish) => void;
}

export function KitchenMenuTabs({
  onEditMenu,
  onEditAddon,
  onEditSideDish,
}: KitchenMenuTabsProps) {
  const [searchParams] = useSearchParams();
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const searchQuery = searchParams.get("search") || "";
  const selectedCategory = searchParams.get("category") || "all";
  const activeTab = searchParams.get("tab") || "items";

  // Fetch all data - React Query handles deduplication
  const { data: menuItemsData = [], isLoading: isLoadingMenuItems } = useQuery<MenuItem[]>({
    queryKey: ['menuItems'],
    queryFn: MenuService.getAllMenuItems,
  });

  const { data: addonsData = [], isLoading: isLoadingAddons } = useQuery<MenuAddon[]>({
    queryKey: ['menuAddons'],
    queryFn: MenuService.getAllMenuAddons,
  });

  const { data: sideDishesData = [], isLoading: isLoadingSideDishes } = useQuery<MenuSideDish[]>({
    queryKey: ['menuSideDishes'],
    queryFn: MenuService.getAllMenuSideDishes,
  });

  const { data: categoriesData = [], isLoading: isLoadingCategories } = useQuery<MenuCategory[]>({
    queryKey: ['menuCategories'],
    queryFn: MenuService.getAllMenuCategories,
  });

  // Mutations
  const toggleMenuItemMutation = useMutation({
    mutationFn: ({ id }: { id: number }) => MenuService.toggleMenuItemAvailability(id, true),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      toast({ title: "Success", description: "Availability updated" });
      setTogglingId(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update availability", variant: "destructive" });
      setTogglingId(null);
    },
  });

  const toggleAddonMutation = useMutation({
    mutationFn: ({ id }: { id: number }) => MenuService.toggleAddonAvailability(id, true),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuAddons'] });
      toast({ title: "Success", description: "Availability updated" });
      setTogglingId(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update availability", variant: "destructive" });
      setTogglingId(null);
    },
  });

  const toggleSideDishMutation = useMutation({
    mutationFn: ({ id }: { id: number }) => MenuService.toggleSideDishAvailability(id, true),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuSideDishes'] });
      toast({ title: "Success", description: "Availability updated" });
      setTogglingId(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update availability", variant: "destructive" });
      setTogglingId(null);
    },
  });

  const deleteMenuItemMutation = useMutation({
    mutationFn: (id: number) => MenuService.deleteMenuItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      toast({ title: "Success", description: "Menu item deleted" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    },
  });

  const deleteAddonMutation = useMutation({
    mutationFn: (id: number) => MenuService.deleteMenuAddon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuAddons'] });
      toast({ title: "Success", description: "Addon deleted" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    },
  });

  const deleteSideDishMutation = useMutation({
    mutationFn: (id: number) => MenuService.deleteMenuSideDish(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuSideDishes'] });
      toast({ title: "Success", description: "Side dish deleted" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    },
  });

  const handleToggleAvailability = (id: number, type: "menu" | "addon" | "side") => {
    setTogglingId(id);
    if (type === "menu") toggleMenuItemMutation.mutate({ id });
    else if (type === "addon") toggleAddonMutation.mutate({ id });
    else toggleSideDishMutation.mutate({ id });
  };

  const handleDelete = (id: number, type: "menu" | "addon" | "side") => {
    if (type === "menu") deleteMenuItemMutation.mutate(id);
    else if (type === "addon") deleteAddonMutation.mutate(id);
    else deleteSideDishMutation.mutate(id);
  };

  const isLoading = isLoadingMenuItems || isLoadingAddons || isLoadingSideDishes || isLoadingCategories;

  // Process menu items with category mapping
  const menuItems: KitchenMenuItem[] = useMemo(() => {
    return menuItemsData
      .filter((item) => item.prepArea === "KITCHEN")
      .map((item) => {
        const category = categoriesData.find((cat) => cat.id === item.categoryId);
        const categoryName = category ? category.name : "Uncategorized";
        return { ...item, category: categoryName, categoryName };
      });
  }, [menuItemsData, categoriesData]);

  // Filter menu items
  const filteredMenuItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "all" ||
        item.category.toLowerCase() === selectedCategory.toLowerCase();
      return matchesSearch && matchesCategory;
    });
  }, [menuItems, searchQuery, selectedCategory]);

  // Filter addons
  const filteredAddons = useMemo(() => {
    return addonsData.filter(
      (addon) => addon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        addon.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [addonsData, searchQuery]);

  // Filter side dishes
  const filteredSideDishes = useMemo(() => {
    return sideDishesData.filter(
      (side) => side.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        side.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [sideDishesData, searchQuery]);

  if (isLoading) {
    return <KitchenMenuLoading message="Loading menu data..." />;
  }

  // Items Tab
  if (activeTab === "items") {
    return (
      <>
        {filteredMenuItems.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="mb-4">No menu items found</p>
            {searchQuery && <p>Try adjusting your search or filters</p>}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMenuItems.map((item) => (
              <MenuCard
                key={item.id}
                item={item}
                onToggleAvailability={(id) => {
                  setTogglingId(id);
                  handleToggleAvailability(id, "menu");
                }}
                onEdit={() => onEditMenu(item)}
                onDelete={(id) => handleDelete(id, "menu")}
                isToggling={togglingId === item.id}
                itemType="menu item"
              />
            ))}
          </div>
        )}
      </>
    );
  }

  // Sides Tab
  if (activeTab === "sides") {
    return (
      <>
        {filteredSideDishes.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="mb-4">No side dishes found</p>
            {searchQuery && <p>Try adjusting your search</p>}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSideDishes.map((side) => (
              <MenuCard
                key={side.id}
                item={side}
                onToggleAvailability={(id) => {
                  setTogglingId(id);
                  handleToggleAvailability(id, "side");
                }}
                onEdit={() => onEditSideDish(side)}
                onDelete={(id) => handleDelete(id, "side")}
                isToggling={togglingId === side.id}
                itemType="side dish"
              />
            ))}
          </div>
        )}
      </>
    );
  }

  // Addons Tab
  return (
    <>
      {filteredAddons.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="mb-4">No addons found</p>
          {searchQuery && <p>Try adjusting your search</p>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAddons.map((addon) => (
            <MenuCard
              key={addon.id}
              item={addon}
              onToggleAvailability={(id) => {
                setTogglingId(id);
                handleToggleAvailability(id, "addon");
              }}
              onEdit={() => onEditAddon(addon)}
              onDelete={(id) => handleDelete(id, "addon")}
              isToggling={togglingId === addon.id}
              itemType="addon"
            />
          ))}
        </div>
      )}
    </>
  );
}