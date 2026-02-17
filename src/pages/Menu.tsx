import React, { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Edit, Trash2, Star, Eye, Loader2, AlertCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { MenuService, type MenuItem, type MenuAddon, type MenuSideDish } from "@/services/menuService";

function MenuCard({ item }: { item: MenuItem }) {
  return (
    <div className={cn(
      "bg-card rounded-xl p-5 shadow-card border border-border/50 hover:shadow-card-hover transition-all duration-100 relative overflow-hidden",
      !item.isAvailable && "opacity-60",
      item.featured && "border-amber-500 border-2 shadow-[0_0_15px_rgba(245,158,11,0.5)]"
    )}>
      {item.featured && (
        <div className="absolute top-0 right-0">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-bl-lg flex items-center gap-1 shadow-lg">
            <Sparkles className="h-3 w-3" />
            Special
          </div>
        </div>
      )}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">{item.name}</h3>
           
          </div>
          <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
        </div>
        <span className="text-lg font-bold text-primary">{item.price.toLocaleString('en-US')}</span>
      </div>
      <div className="flex flex-col justify-between gap-2">
        <div className="flex items-center text-sm text-muted-foreground">
           
          {item.menuCategory && (
            <Badge variant="outline">{item.menuCategory.name}</Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          {item.requiresSideDish && (
            <Badge variant="secondary" className="text-xs mr-2">
              Side Dish
            </Badge>
          )}
          {item.hasAddons && (
            <Badge variant="secondary" className="text-xs mr-2">
              Addons
            </Badge>
          )}
          {item.seasonal && (
            <Badge variant="outline" className="text-xs mr-2 border-orange-300 text-orange-600">
              Limited
            </Badge>
          )}
           
        </div>
      </div>
    </div>
  );
}

function SideCard({ side }: { side: MenuSideDish }) {
  return (
    <div className={cn(
      "bg-card rounded-xl p-5 shadow-card border border-border/50 hover:shadow-card-hover transition-all duration-300",
      !side.isAvailable && "opacity-60"
    )}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">{side.name}</h3>
        
          </div>
          <p className="text-sm text-muted-foreground mt-1">{side.description}</p>
        </div>
        <span className="text-lg font-bold text-primary">{side.price.toLocaleString('en-US')}</span>
      </div>
      <div className="flex items-center justify-between">
        <Badge variant={side.isAvailable ? "default" : "secondary"}>
          {side.isAvailable ? "Available" : "Unavailable"}
        </Badge>
      </div>
    </div>
  );
}

function AddonCard({ addon }: { addon: MenuAddon }) {
  return (
    <div className={cn(
      "bg-card rounded-xl p-5 shadow-card border border-border/50 hover:shadow-card-hover transition-all duration-300",
      !addon.isAvailable && "opacity-60"
    )}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">{addon.name}</h3>
           
          </div>
          <p className="text-sm text-muted-foreground mt-1">{addon.description}</p>
        </div>
        <span className="text-lg font-bold text-primary">{addon.price.toLocaleString('en-US')}</span>
      </div>
      <div className="flex items-center justify-between">
        <Badge variant={addon.isAvailable ? "default" : "secondary"}>
          {addon.isAvailable ? "Available" : "Unavailable"}
        </Badge>
      </div>
    </div>
  );
}

export default function Menu() {
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch menu items
  const { data: menuItems = [], isLoading: itemsLoading, isError: itemsError } = useQuery<MenuItem[]>({
    queryKey: ["menuItems"],
    queryFn: MenuService.getAllMenuItems,
  });

  // Fetch addons
  const { data: addons = [], isLoading: addonsLoading } = useQuery<MenuAddon[]>({
    queryKey: ["menuAddons"],
    queryFn: MenuService.getAllMenuAddons,
  });

  // Fetch side dishes
  const { data: sideDishes = [], isLoading: sidesLoading } = useQuery<MenuSideDish[]>({
    queryKey: ["menuSideDishes"],
    queryFn: MenuService.getAllMenuSideDishes,
  });

  // Filter menu items based on search
  const filteredMenuItems = menuItems.filter((item) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      item.name?.toLowerCase().includes(searchLower) ||
      item.description?.toLowerCase().includes(searchLower) ||
      item.menuCategory?.name?.toLowerCase().includes(searchLower)
    );
  });

  // Filter addons based on search
  const filteredAddons = addons.filter((addon) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      addon.name?.toLowerCase().includes(searchLower) ||
      addon.description?.toLowerCase().includes(searchLower)
    );
  });

  // Filter side dishes based on search
  const filteredSideDishes = sideDishes.filter((side) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      side.name?.toLowerCase().includes(searchLower) ||
      side.description?.toLowerCase().includes(searchLower)
    );
  });


  const totalAddons = addons.length;
  const totalSideDishes = sideDishes.length;

  return (
    <MainLayout title="Menu" subtitle="Manage your restaurant menu items">
      <div className="space-y-6 animate-fade-in">
       

        {/* Actions Bar */}
        <div className="w-full flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 ">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search menu items..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
        </div>

        {/* Error State */}
        {itemsError && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <p className="text-destructive">Failed to load menu items.</p>
          </div>
        )}

        {/* Loading State */}
        {itemsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Loading menu items...</span>
          </div>
        ) : (
          /* Tabs Section - Full Width Tabs */
          <Tabs defaultValue="menu-items" className="w-full">
            <TabsList className="w-full bg-muted/50 p-1 grid grid-cols-3">
              <TabsTrigger value="menu-items" className="w-full">Menu Items</TabsTrigger>
              <TabsTrigger value="sides" className="w-full">Sides </TabsTrigger>
              <TabsTrigger value="addons" className="w-full">Addons</TabsTrigger>
            </TabsList>

            {/* Menu Items Tab */}
            <TabsContent value="menu-items" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMenuItems.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-muted-foreground">
                    No menu items found.
                  </div>
                ) : (
                  filteredMenuItems.map((item) => (
                    <MenuCard key={item.id} item={item} />
                  ))
                )}
              </div>
            </TabsContent>

            {/* Side Dishes Tab */}
            <TabsContent value="sides" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSideDishes.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-muted-foreground">
                    No side dishes found.
                  </div>
                ) : (
                  filteredSideDishes.map((side) => (
                    <SideCard key={side.id} side={side} />
                  ))
                )}
              </div>
            </TabsContent>

            {/* Addons Tab */}
            <TabsContent value="addons" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAddons.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-muted-foreground">
                    No addons found.
                  </div>
                ) : (
                  filteredAddons.map((addon) => (
                    <AddonCard key={addon.id} addon={addon} />
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </MainLayout>
  );
}
