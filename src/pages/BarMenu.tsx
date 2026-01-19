import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Edit, Trash2, Star, ToggleLeft, ToggleRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, useSearchParams } from "react-router-dom";
import { useState } from "react";

interface BarMenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: "cocktail" | "wine" | "beer" | "non-alcoholic";
  available: boolean;
  rating?: number;
  orders?: number;
}

const barMenuItems: BarMenuItem[] = [
  {
    id: 1,
    name: "Mojito",
    description: "White rum, lime juice, mint, soda water",
    price: 12.99 * 2400,
    category: "cocktail",
    available: true,
    rating: 4.8,
    orders: 245
  },
  {
    id: 2,
    name: "Old Fashioned",
    description: "Bourbon, sugar, bitters, orange twist",
    price: 14.99 * 2400,
    category: "cocktail",
    available: true,
    rating: 4.9,
    orders: 189
  },
  {
    id: 3,
    name: "Espresso Martini",
    description: "Vodka, coffee liqueur, espresso, simple syrup",
    price: 13.99 * 2400,
    category: "cocktail",
    available: true,
    rating: 4.7,
    orders: 167
  },
  {
    id: 4,
    name: "Margarita",
    description: "Tequila, lime juice, triple sec, salt rim",
    price: 11.99 * 2400,
    category: "cocktail",
    available: false,
    rating: 4.6,
    orders: 134
  },
  {
    id: 5,
    name: "House Red Wine",
    description: "Glass of select red wine blend",
    price: 8.99 * 2400,
    category: "wine",
    available: true,
    rating: 4.5,
    orders: 289
  },
  {
    id: 6,
    name: "Sparkling Water",
    description: "Premium sparkling mineral water",
    price: 3.99 * 2400,
    category: "non-alcoholic",
    available: true,
    rating: 4.3,
    orders: 456
  },
  {
    id: 7,
    name: "Corona",
    description: "Mexican lager with lime wedge",
    price: 5.99 * 2400,
    category: "beer",
    available: true,
    rating: 4.4,
    orders: 234
  },
  {
    id: 8,
    name: "Craft IPA",
    description: "Local craft India Pale Ale",
    price: 7.99 * 2400,
    category: "beer",
    available: true,
    rating: 4.6,
    orders: 198
  },
];

function BarMenuCard({ item, onToggleAvailability }: { item: BarMenuItem; onToggleAvailability: (id: number) => void }) {
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

export default function BarMenu() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const [menuItems, setMenuItems] = useState<BarMenuItem[]>(barMenuItems);

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
  }, {} as Record<string, BarMenuItem[]>);

  return (
    <MainLayout title="Bar Menu" subtitle="Manage bar menu items and availability">
      <div className="space-y-6 animate-fade-in">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search bar menu items..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Link to="/menu/new?type=bar">
            <Button className="gradient-primary text-primary-foreground shadow-glow hover:shadow-lg transition-shadow">
              <Plus className="h-4 w-4 mr-2" />
              Add Bar Item
            </Button>
          </Link>
        </div>

        {/* Menu Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="all">All Items</TabsTrigger>
            <TabsTrigger value="cocktail">Cocktails</TabsTrigger>
            <TabsTrigger value="wine">Wines</TabsTrigger>
            <TabsTrigger value="beer">Beers</TabsTrigger>
            <TabsTrigger value="non-alcoholic">Non-Alcoholic</TabsTrigger>
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
                      <BarMenuCard
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
                  <BarMenuCard
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
