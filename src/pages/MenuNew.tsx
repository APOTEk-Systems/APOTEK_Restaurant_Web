import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, UtensilsCrossed, DollarSign, Clock, Tag, Plus, X } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const categories = ["Appetizers", "Mains", "Desserts", "Beverages", "Sides", "Specials"];
const allergens = ["Gluten", "Dairy", "Nuts", "Shellfish", "Eggs", "Soy", "Fish"];
const dietaryOptions = ["Vegetarian", "Vegan", "Gluten-Free", "Keto", "Low-Carb", "Dairy-Free"];

// Side dish options for main dishes
const sideDishOptions = [
  { id: 1, name: "Garlic Mashed Potatoes", price: 5.99 },
  { id: 2, name: "Seasonal Vegetables", price: 4.99 },
  { id: 3, name: "Truffle Fries", price: 6.99 },
  { id: 4, name: "House Salad", price: 4.99 },
  { id: 5, name: "Grilled Asparagus", price: 5.99 },
  { id: 6, name: "Rice Pilaf", price: 3.99 },
];

export default function MenuNew() {
  const [searchParams] = useSearchParams();
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [newIngredient, setNewIngredient] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSideDishes, setSelectedSideDishes] = useState<number[]>([]);

  // Determine categories based on type parameter
  const type = searchParams.get('type');
  const isKitchen = type === 'kitchen';
  const isBar = type === 'bar';

  const kitchenCategories = ["Appetizers", "Main Dishes", "Side Dishes", "Desserts"];
  const barCategories = ["Cocktails", "Wines", "Beers", "Non-Alcoholic"];
  const allCategories = ["Appetizers", "Mains", "Desserts", "Beverages", "Sides", "Specials"];

  const categories = isKitchen ? kitchenCategories :
                    isBar ? barCategories :
                    allCategories;

  // Set default category based on type
  useEffect(() => {
    if (isKitchen) {
      setSelectedCategory("Appetizers");
    } else if (isBar) {
      setSelectedCategory("Cocktails");
    }
  }, [isKitchen, isBar]);

  const toggleAllergen = (allergen: string) => {
    setSelectedAllergens(prev =>
      prev.includes(allergen) ? prev.filter(a => a !== allergen) : [...prev, allergen]
    );
  };

  const toggleDietary = (option: string) => {
    setSelectedDietary(prev =>
      prev.includes(option) ? prev.filter(o => o !== option) : [...prev, option]
    );
  };

  const addIngredient = () => {
    if (newIngredient.trim() && !ingredients.includes(newIngredient.trim())) {
      setIngredients([...ingredients, newIngredient.trim()]);
      setNewIngredient("");
    }
  };

  const removeIngredient = (ingredient: string) => {
    setIngredients(ingredients.filter(i => i !== ingredient));
  };

  const toggleSideDish = (sideDishId: number) => {
    setSelectedSideDishes(prev =>
      prev.includes(sideDishId)
        ? prev.filter(id => id !== sideDishId)
        : [...prev, sideDishId]
    );
  };

  return (
    <MainLayout title={isBar ? "Add Bar Item" : "Add Menu Item"} subtitle={isBar ? "Create a new drink for your bar menu" : "Create a new dish for your menu"}>
      <div className="space-y-6 animate-fade-in max-w-3xl">
        {/* Back Button */}
        <Link to={isKitchen ? "/kitchen/menu" : isBar ? "/bar/menu" : "/menu"}>
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to {isKitchen ? "Kitchen" : isBar ? "Bar" : "Main"} Menu
          </Button>
        </Link>

        <div className="grid gap-6">
          {/* Basic Information */}
          <Card className="shadow-card border-border/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <UtensilsCrossed className="h-5 w-5 text-primary" />
                {isBar ? "Drink Information" : "Dish Information"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{isBar ? "Drink Name" : "Dish Name"} *</Label>
                  <Input id="name" placeholder={isBar ? "e.g., Mojito" : "e.g., Grilled Salmon"} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat.toLowerCase()}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea id="description" placeholder={isBar ? "Describe the drink, ingredients, and serving style..." : "Describe the dish, preparation, and presentation..."} rows={3} />
              </div>
              <div className="space-y-2">
                <Label>{isBar ? "Ingredients" : "Ingredients"}</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder={isBar ? "Add ingredient (e.g., Vodka, Lime)" : "Add ingredient"}
                    value={newIngredient}
                    onChange={(e) => setNewIngredient(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addIngredient())}
                  />
                  <Button type="button" variant="outline" onClick={addIngredient}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {ingredients.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {ingredients.map(ingredient => (
                      <Badge key={ingredient} variant="secondary" className="gap-1">
                        {ingredient}
                        <button onClick={() => removeIngredient(ingredient)} className="ml-1 hover:text-destructive">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Side Dishes (only show for main dishes) */}
          {(selectedCategory === "main dishes" || selectedCategory === "mains") && (
            <Card className="shadow-card border-border/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <UtensilsCrossed className="h-5 w-5 text-primary" />
                  Side Dish Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Select side dishes that can be included with this main dish
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {sideDishOptions.map(sideDish => (
                    <div
                      key={sideDish.id}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg border border-border/50 cursor-pointer transition-all",
                        selectedSideDishes.includes(sideDish.id)
                          ? "bg-primary/10 border-primary/30"
                          : "hover:bg-muted/30"
                      )}
                      onClick={() => toggleSideDish(sideDish.id)}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id={`side-dish-${sideDish.id}`}
                          checked={selectedSideDishes.includes(sideDish.id)}
                          onChange={() => toggleSideDish(sideDish.id)}
                          className="h-4 w-4 rounded border-border"
                          aria-label={`Include ${sideDish.name} as side dish`}
                        />
                        <div>
                          <label htmlFor={`side-dish-${sideDish.id}`} className="cursor-pointer">
                            <p className="font-medium text-foreground">{sideDish.name}</p>
                            <p className="text-sm text-muted-foreground">${sideDish.price.toFixed(2)}</p>
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {selectedSideDishes.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    <p className="text-sm font-medium text-foreground">Selected Sides:</p>
                    {selectedSideDishes.map(sideId => {
                      const sideDish = sideDishOptions.find(s => s.id === sideId);
                      return (
                        <Badge key={sideId} variant="secondary" className="gap-1">
                          {sideDish?.name} (${sideDish?.price.toFixed(2)})
                        </Badge>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Pricing & Time */}
          <Card className="shadow-card border-border/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-success" />
                Pricing & Preparation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($) *</Label>
                  <Input id="price" type="number" min="0" step="0.01" placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cost">Cost ($)</Label>
                  <Input id="cost" type="number" min="0" step="0.01" placeholder={isBar ? "Liquor cost" : "Food cost"} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prepTime">{isBar ? "Prep Time (sec)" : "Prep Time (mins)"}</Label>
                  <Input id="prepTime" type="number" min="0" placeholder={isBar ? "30" : "15"} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="calories">Calories</Label>
                  <Input id="calories" type="number" min="0" placeholder="Optional" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="servingSize">Serving Size</Label>
                  <Input id="servingSize" placeholder="e.g., 8 oz" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dietary & Allergens */}
          <Card className="shadow-card border-border/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Tag className="h-5 w-5 text-warning" />
                Dietary Info & Allergens
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Allergens</Label>
                <div className="flex flex-wrap gap-2">
                  {allergens.map(allergen => (
                    <Badge
                      key={allergen}
                      variant={selectedAllergens.includes(allergen) ? "default" : "outline"}
                      className="cursor-pointer transition-all hover:scale-105"
                      onClick={() => toggleAllergen(allergen)}
                    >
                      {allergen}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Dietary Options</Label>
                <div className="flex flex-wrap gap-2">
                  {dietaryOptions.map(option => (
                    <Badge
                      key={option}
                      variant={selectedDietary.includes(option) ? "default" : "outline"}
                      className="cursor-pointer transition-all hover:scale-105"
                      onClick={() => toggleDietary(option)}
                    >
                      {option}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Availability */}
          <Card className="shadow-card border-border/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                Availability
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                <div>
                  <Label htmlFor="available" className="font-medium">Available on Menu</Label>
                  <p className="text-sm text-muted-foreground">Customers can order this item</p>
                </div>
                <Switch id="available" defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                <div>
                  <Label htmlFor="featured" className="font-medium">Featured Item</Label>
                  <p className="text-sm text-muted-foreground">Highlight on menu and recommendations</p>
                </div>
                <Switch id="featured" />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                <div>
                  <Label htmlFor="seasonal" className="font-medium">Seasonal Item</Label>
                  <p className="text-sm text-muted-foreground">Limited time availability</p>
                </div>
                <Switch id="seasonal" />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Link to={isKitchen ? "/kitchen/menu" : isBar ? "/bar/menu" : "/menu"}>
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button className="gradient-primary text-primary-foreground shadow-glow hover:shadow-lg transition-shadow">
              <UtensilsCrossed className="h-4 w-4 mr-2" />
              {isBar ? "Add Bar Item" : "Add Menu Item"}
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}