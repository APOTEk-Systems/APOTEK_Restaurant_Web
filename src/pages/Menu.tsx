import React from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { AddSideDishDialog } from "@/components/menu/AddSideDishDialog";
import { AddAddonDialog } from "@/components/menu/AddAddonDialog";
import { useQuery } from "@tanstack/react-query";
import { MenuService } from "@/services/menuService";
import type { MenuAddon, MenuItem, MenuSideDish } from "@/services/menuService";

function MenuCard({ item }: { item: MenuItem }) {
  return (
    <div
      className={cn(
        "bg-card rounded-xl p-5 shadow-card border border-border/50 hover:shadow-card-hover transition-all duration-300 hover-lift",
        !item.isAvailable && "opacity-60"
      )}
    >
      <div className="flex items-start justify-between mb-3 gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-foreground">{item.name}</h3>
            {!item.isAvailable && (
              <Badge variant="secondary" className="text-xs">Unavailable</Badge>
            )}
            {item.requiresSideDish && (
              <Badge variant="secondary" className="text-xs">Comes with side dish</Badge>
            )}
            {item.hasAddons && (
              <Badge variant="secondary" className="text-xs">Has addons</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {item.description || "No description"}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            {item.menuCategory?.name || "Uncategorized"} • {item.prepArea}
          </p>
        </div>
        <span className="text-lg font-bold text-primary whitespace-nowrap">
          {item.price.toLocaleString("en-US")}
        </span>
      </div>
    </div>
  );
}

function SimpleCard({
  item,
}: {
  item: MenuSideDish | MenuAddon;
}) {
  return (
    <div
      className={cn(
        "bg-card rounded-xl p-5 shadow-card border border-border/50 hover:shadow-card-hover transition-all duration-300",
        !item.isAvailable && "opacity-60"
      )}
    >
      <div className="flex items-start justify-between mb-3 gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-foreground">{item.name}</h3>
            {!item.isAvailable && (
              <Badge variant="secondary" className="text-xs">Unavailable</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {item.description || "No description"}
          </p>
        </div>
        <span className="text-lg font-bold text-primary whitespace-nowrap">
          {item.price.toLocaleString("en-US")}
        </span>
      </div>
    </div>
  );
}

export default function Menu() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isSideDialogOpen, setIsSideDialogOpen] = React.useState(false);
  const [isAddonDialogOpen, setIsAddonDialogOpen] = React.useState(false);

  const { data: menuItems = [], isLoading: isMenuLoading, error: menuError } = useQuery({
    queryKey: ["menuItems"],
    queryFn: MenuService.getAllMenuItems,
  });

  const { data: sideDishes = [], isLoading: isSidesLoading } = useQuery({
    queryKey: ["sideDishes"],
    queryFn: MenuService.getAllMenuSideDishes,
  });

  const { data: addons = [], isLoading: isAddonsLoading } = useQuery({
    queryKey: ["addons"],
    queryFn: MenuService.getAllMenuAddons,
  });

  const normalizedSearch = searchQuery.trim().toLowerCase();

  const filteredMenuItems = menuItems.filter((item) => {
    if (!normalizedSearch) return true;
    return (
      item.name.toLowerCase().includes(normalizedSearch) ||
      item.description?.toLowerCase().includes(normalizedSearch) ||
      item.menuCategory?.name?.toLowerCase().includes(normalizedSearch)
    );
  });

  const filteredSides = sideDishes.filter((item) => {
    if (!normalizedSearch) return true;
    return (
      item.name.toLowerCase().includes(normalizedSearch) ||
      item.description?.toLowerCase().includes(normalizedSearch)
    );
  });

  const filteredAddons = addons.filter((item) => {
    if (!normalizedSearch) return true;
    return (
      item.name.toLowerCase().includes(normalizedSearch) ||
      item.description?.toLowerCase().includes(normalizedSearch)
    );
  });

  const categoryMap = filteredMenuItems.reduce<Record<string, MenuItem[]>>((acc, item) => {
    const categoryName = item.menuCategory?.name || "Uncategorized";
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(item);
    return acc;
  }, {});

  const categoryEntries = Object.entries(categoryMap);

  const handleAddSideDish = () => {
    setIsSideDialogOpen(false);
  };

  const handleAddAddon = () => {
    setIsAddonDialogOpen(false);
  };

  if (isMenuLoading || isSidesLoading || isAddonsLoading) {
    return (
      <MainLayout title="Menu" subtitle="Manage your restaurant menu items">
        <div className="space-y-6 animate-fade-in">
          <div className="text-center py-8">Loading menu data...</div>
        </div>
      </MainLayout>
    );
  }

  if (menuError) {
    return (
      <MainLayout title="Menu" subtitle="Manage your restaurant menu items">
        <div className="space-y-6 animate-fade-in">
          <div className="text-center py-8 text-destructive">
            Error loading menu: {menuError.message}
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Menu" subtitle="Manage your restaurant menu items">
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search menu items..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Link to="/menu/new">
            <Button className="gradient-primary text-primary-foreground shadow-glow hover:shadow-lg transition-shadow">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </Link>
        </div>

        <div className="space-y-8 mt-6">
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Menu Items</h2>
            {categoryEntries.length > 0 ? (
              categoryEntries.map(([category, items]) => (
                <div key={category} className="space-y-4">
                  <h3 className="text-base font-medium text-foreground">{category}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map((item) => (
                      <MenuCard key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">No menu items found</div>
            )}
          </section>

          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-foreground">Side Dishes</h2>
              <Button
                onClick={() => setIsSideDialogOpen(true)}
                className="gradient-primary text-primary-foreground shadow-glow hover:shadow-lg transition-shadow"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Side Dish
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSides.length > 0 ? (
                filteredSides.map((side) => <SimpleCard key={side.id} item={side} />)
              ) : (
                <div className="text-muted-foreground">No side dishes found</div>
              )}
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-foreground">Addons</h2>
              <Button
                onClick={() => setIsAddonDialogOpen(true)}
                className="gradient-primary text-primary-foreground shadow-glow hover:shadow-lg transition-shadow"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Addon
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAddons.length > 0 ? (
                filteredAddons.map((addon) => <SimpleCard key={addon.id} item={addon} />)
              ) : (
                <div className="text-muted-foreground">No addons found</div>
              )}
            </div>
          </section>
        </div>

        <AddSideDishDialog
          isOpen={isSideDialogOpen}
          onClose={() => setIsSideDialogOpen(false)}
          onAddSideDish={handleAddSideDish}
        />

        <AddAddonDialog
          isOpen={isAddonDialogOpen}
          onClose={() => setIsAddonDialogOpen(false)}
          onAddAddon={handleAddAddon}
        />
      </div>
    </MainLayout>
  );
}
