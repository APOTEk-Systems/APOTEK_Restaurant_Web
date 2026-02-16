import React, { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Plus, Search, Edit, Trash2, Star, Eye, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MenuService, type MenuItem, type MenuAddon, type MenuSideDish } from "@/services/menuService";

function MenuCard({ item }: { item: MenuItem }) {
  return (
    <div className={cn(
      "bg-card rounded-xl p-5 shadow-card border border-border/50 hover:shadow-card-hover transition-all duration-300",
      !item.isAvailable && "opacity-60"
    )}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">{item.name}</h3>
            {!item.isAvailable && (
              <Badge variant="secondary" className="text-xs">Unavailable</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
        </div>
        <span className="text-lg font-bold text-primary">{item.price.toLocaleString('en-US')}</span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Star className="h-4 w-4 text-warning fill-warning" />
            {item.rating || "N/A"}
          </span>
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
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Eye className="h-4 w-4" />
          </Button>
        </div>
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
              <TabsTrigger value="sides" className="w-full">Sides ({sidesLoading ? "..." : totalSideDishes})</TabsTrigger>
              <TabsTrigger value="addons" className="w-full">Addons ({addonsLoading ? "..." : totalAddons})</TabsTrigger>
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
              <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSideDishes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                          No side dishes found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredSideDishes.map((side) => (
                        <TableRow key={side.id}>
                          <TableCell className="font-medium">{side.name}</TableCell>
                          <TableCell className="text-muted-foreground max-w-xs truncate">
                            {side.description || "-"}
                          </TableCell>
                          <TableCell className="text-right">
                            {side.price.toLocaleString('en-US')}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant={side.isAvailable ? "default" : "secondary"}>
                              {side.isAvailable ? "Available" : "Unavailable"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Addons Tab */}
            <TabsContent value="addons" className="mt-6">
              <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAddons.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                          No addons found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAddons.map((addon) => (
                        <TableRow key={addon.id}>
                          <TableCell className="font-medium">{addon.name}</TableCell>
                          <TableCell className="text-muted-foreground max-w-xs truncate">
                            {addon.description || "-"}
                          </TableCell>
                          <TableCell className="text-right">
                            {addon.price.toLocaleString('en-US')}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant={addon.isAvailable ? "default" : "secondary"}>
                              {addon.isAvailable ? "Available" : "Unavailable"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </MainLayout>
  );
}
