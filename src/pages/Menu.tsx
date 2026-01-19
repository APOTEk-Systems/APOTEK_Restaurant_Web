import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Edit, Trash2, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

const menuItems = {
  appetizers: [
    { id: 1, name: "Caesar Salad", description: "Fresh romaine, parmesan, croutons", price: 14.00 * 2400, rating: 4.8, orders: 245, available: true },
    { id: 2, name: "Lobster Bisque", description: "Creamy soup with fresh lobster", price: 18.00 * 2400, rating: 4.9, orders: 189, available: true },
    { id: 3, name: "Bruschetta", description: "Toasted bread, tomato, basil", price: 12.00 * 2400, rating: 4.5, orders: 167, available: false },
  ],
  mains: [
    { id: 4, name: "Grilled Salmon", description: "Atlantic salmon, lemon butter sauce", price: 32.00 * 2400, rating: 4.9, orders: 312, available: true },
    { id: 5, name: "Ribeye Steak", description: "12oz prime ribeye, herb butter", price: 45.00 * 2400, rating: 4.8, orders: 287, available: true },
    { id: 6, name: "Chicken Parmesan", description: "Breaded chicken, marinara, mozzarella", price: 26.00 * 2400, rating: 4.7, orders: 198, available: true },
    { id: 7, name: "Pasta Carbonara", description: "Spaghetti, pancetta, egg, parmesan", price: 22.00 * 2400, rating: 4.6, orders: 234, available: true },
  ],
  desserts: [
    { id: 8, name: "Tiramisu", description: "Classic Italian coffee dessert", price: 10.00 * 2400, rating: 4.9, orders: 156, available: true },
    { id: 9, name: "Cheesecake", description: "New York style with berry sauce", price: 12.00 * 2400, rating: 4.7, orders: 134, available: true },
  ],
  beverages: [
    { id: 10, name: "House Red Wine", description: "Glass of select red wine", price: 12.00 * 2400, rating: 4.5, orders: 289, available: true },
    { id: 11, name: "Espresso", description: "Double shot Italian espresso", price: 4.00 * 2400, rating: 4.8, orders: 456, available: true },
  ],
};

function MenuCard({ item }: { item: typeof menuItems.appetizers[0] }) {
  return (
    <div className={cn(
      "bg-card rounded-xl p-5 shadow-card border border-border/50 hover:shadow-card-hover transition-all duration-300 hover-lift",
      !item.available && "opacity-60"
    )}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">{item.name}</h3>
            {!item.available && (
              <Badge variant="secondary" className="text-xs">Unavailable</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
        </div>
        <span className="text-lg font-bold text-primary">{item.price.toLocaleString('en-US', )}</span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Star className="h-4 w-4 text-warning fill-warning" />
            {item.rating}
          </span>
          <span>{item.orders} orders</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function Menu() {
  return (
    <MainLayout title="Menu" subtitle="Manage your restaurant menu items">
      <div className="space-y-6 animate-fade-in">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search menu items..." className="pl-9" />
          </div>
          <Link to="/menu/new">
            <Button className="gradient-primary text-primary-foreground shadow-glow hover:shadow-lg transition-shadow">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </Link>
        </div>

        {/* Menu Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="all">All Items</TabsTrigger>
            <TabsTrigger value="appetizers">Appetizers</TabsTrigger>
            <TabsTrigger value="mains">Main Courses</TabsTrigger>
            <TabsTrigger value="desserts">Desserts</TabsTrigger>
            <TabsTrigger value="beverages">Beverages</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="space-y-8">
              {Object.entries(menuItems).map(([category, items]) => (
                <div key={category}>
                  <h2 className="text-lg font-semibold text-foreground capitalize mb-4">{category}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map((item) => (
                      <MenuCard key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {Object.entries(menuItems).map(([category, items]) => (
            <TabsContent key={category} value={category} className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((item) => (
                  <MenuCard key={item.id} item={item} />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </MainLayout>
  );
}
