import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Edit, Trash2, Star, ToggleLeft, ToggleRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, useSearchParams } from "react-router-dom";
import { useState } from "react";

interface KitchenMenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: "appetizer" | "side dish" | "main dish" | "dessert";
  available: boolean;
  rating?: number;
  orders?: number;
}

const kitchenMenuItems: KitchenMenuItem[] = [
  {
    id: 1,
    name: "Grilled Salmon",
    description: "Atlantic salmon with lemon butter sauce",
    price: 28.99 * 2400,
    category: "main dish",
    available: true,
    rating: 4.9,
    orders: 312
  },
  {
    id: 2,
    name: "Beef Wellington",
    description: "12oz prime ribeye with herb butter",
    price: 45.99 * 2400,
    category: "main dish",
    available: true,
    rating: 4.8,
    orders: 287
  },
  {
    id: 3,
    name: "Caesar Salad",
    description: "Fresh romaine, parmesan, croutons",
    price: 12.99 * 2400,
    category: "appetizer",
    available: true,
    rating: 4.8,
    orders: 245
  },
  {
    id: 4,
    name: "Mushroom Risotto",
    description: "Creamy risotto with wild mushrooms",
    price: 22.99 * 2400,
    category: "side dish",
    available: false,
    rating: 4.7,
    orders: 189
  },
  {
    id: 5,
    name: "Chocolate Lava Cake",
    description: "Warm chocolate cake with vanilla ice cream",
    price: 9.99 * 2400,
    category: "dessert",
    available: true,
    rating: 4.9,
    orders: 156
  },
  {
    id: 6,
    name: "Tiramisu",
    description: "Classic Italian coffee dessert",
    price: 8.99 * 2400,
    category: "dessert",
    available: true,
    rating: 4.7,
    orders: 134
  },
  {
    id: 7,
    name: "Garlic Bread",
    description: "Toasted bread with garlic butter",
    price: 6.99 * 2400,
    category: "appetizer",
    available: true,
    rating: 4.5,
    orders: 167
  },
  {
    id: 8,
    name: "Truffle Mash",
    description: "Creamy mashed potatoes with truffle oil",
    price: 7.99 * 2400,
    category: "side dish",
    available: true,
    rating: 4.6,
    orders: 198
  },
];

function KitchenMenuCard({ item, onToggleAvailability }: { item: KitchenMenuItem; onToggleAvailability: (id: number) => void }) {
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
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onToggleAvailability(item.id)}
          >
            {item.available ? (
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
  const [searchParams, setSearchParams] = useSearchParams();
  const [menuItems, setMenuItems] = useState<KitchenMenuItem[]>(kitchenMenuItems);

  const toggleAvailability = (id: number) => {
    setMenuItems(menuItems.map(item =>
      item.id === id ? { ...item, available: !item.available } : item
    ));
  };

  const filteredItems = menuItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group items by category
  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, KitchenMenuItem[]>);

  return (
    <MainLayout title="Kitchen Menu" subtitle="Manage kitchen menu items and availability">
      <div className="space-y-6 animate-fade-in">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search kitchen menu items..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Link to="/menu/new?type=kitchen">
            <Button className="gradient-primary text-primary-foreground shadow-glow hover:shadow-lg transition-shadow">
              <Plus className="h-4 w-4 mr-2" />
              Add Kitchen Item
            </Button>
          </Link>
        </div>

        {/* Menu Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="all">All Items</TabsTrigger>
            <TabsTrigger value="appetizer">Appetizers</TabsTrigger>
            <TabsTrigger value="main dish">Main Dishes</TabsTrigger>
            <TabsTrigger value="side dish">Side Dishes</TabsTrigger>
            <TabsTrigger value="dessert">Desserts</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="space-y-8">
              {Object.entries(groupedItems).map(([category, items]) => (
                <div key={category}>
                  <h2 className="text-lg font-semibold text-foreground capitalize mb-4">
                    {category.replace('-', ' ')}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map((item) => (
                      <KitchenMenuCard
                        key={item.id}
                        item={item}
                        onToggleAvailability={toggleAvailability}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {Object.entries(groupedItems).map(([category, items]) => (
            <TabsContent key={category} value={category} className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((item) => (
                  <KitchenMenuCard
                    key={item.id}
                    item={item}
                    onToggleAvailability={toggleAvailability}
                  />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </MainLayout>
  );
}
