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
import { useMutation, useQuery } from "@tanstack/react-query";
import { MenuService } from "@/services/menuService";
import { useToast } from "@/hooks/use-toast";

// Import types from menu service
import { MenuCategory, MenuAddon, MenuSideDish } from "@/services/menuService";

const allergens = ["Gluten", "Dairy", "Nuts", "Shellfish", "Eggs", "Soy", "Fish"];
const dietaryOptions = ["Vegetarian", "Vegan", "Gluten-Free", "Keto", "Low-Carb", "Dairy-Free"];

// No hardcoded side dish options - we fetch from backend

export default function MenuNew() {
  const [searchParams] = useSearchParams();
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [newIngredient, setNewIngredient] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSideDishes, setSelectedSideDishes] = useState<number[]>([]);
  const [selectedAddons, setSelectedAddons] = useState<number[]>([]);
  const [hasAddons, setHasAddons] = useState(false);
  const [requiresSideDish, setRequiresSideDish] = useState(false);
  // Removed state management - using React Query data directly
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingAddons, setLoadingAddons] = useState(false);
  const [loadingSideDishes, setLoadingSideDishes] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    cost: 0,
    prepTime: 0,
    calories: 0,
    servingSize: "",
    available: true,
    featured: false,
    seasonal: false
  });
  const { toast } = useToast();

  // Determine categories based on type parameter
  const type = searchParams.get('type');
  const isKitchen = type === 'kitchen';
  const isBar = type === 'bar';

  // Remove hardcoded categories - we'll fetch from API
  // const kitchenCategories = ["Appetizers", "Main Dishes", "Side Dishes", "Desserts"];
  // const barCategories = ["Cocktails", "Wines", "Beers", "Non-Alcoholic"];
  // const allCategories = ["Appetizers", "Mains", "Desserts", "Beverages", "Sides", "Specials"];

  // const categories = isKitchen ? kitchenCategories :
  //                   isBar ? barCategories :
  //                   allCategories;

  // Filter categories based on menu type
 // Filter categories based on prep area
 // Filter categories based on prep area will be defined after categories


  // Fetch categories using React Query
  const { data: categoriesData, isLoading: isLoadingCategories, error: categoriesError } = useQuery<MenuCategory[], Error>({
    queryKey: ['menuCategories'],
    queryFn: MenuService.getAllMenuCategories,
  });

  // Handle category selection and errors with useEffect
  useEffect(() => {
    if (categoriesData) {
      // Set default category based on type
      if (isKitchen) {
        const kitchenCat = categoriesData.find(cat =>
          ["Appetizers", "Main Dishes", "Side Dishes", "Desserts"].includes(cat.name)
        );
        setSelectedCategory(kitchenCat?.name || "Appetizers");
      } else if (isBar) {
        const barCat = categoriesData.find(cat =>
          ["Cocktails", "Wines", "Beers", "Non-Alcoholic"].includes(cat.name)
        );
        setSelectedCategory(barCat?.name || "Cocktails");
      } else if (categoriesData.length > 0) {
        setSelectedCategory(categoriesData[0].name);
      }
    }
  }, [categoriesData, isKitchen, isBar]);

  useEffect(() => {
    if (categoriesError) {
      console.error("Error fetching categories:", categoriesError);
      toast({
        title: "Error",
        description: "Failed to load menu categories",
        variant: "destructive"
      });
    }
  }, [categoriesError, toast]);

  // Use categories data directly
  const categories = categoriesData || [];

  // Filter categories based on prep area
  const filteredCategories = categories.filter(category => {
    if (isKitchen) return category.prepArea === 'KITCHEN';
    if (isBar) return category.prepArea === 'BAR';
    return true; // keep all if neither is selected
  });

  // Fetch addons using React Query
  const { data: addonsData, isLoading: isLoadingAddons, error: addonsError } = useQuery<MenuAddon[], Error>({
    queryKey: ['menuAddons'],
    queryFn: MenuService.getAllMenuAddons,
    enabled: hasAddons,
  });

  // Handle addons errors with useEffect
  useEffect(() => {
    if (addonsError) {
      console.error("Error fetching addons:", addonsError);
      toast({
        title: "Error",
        description: "Failed to load addons",
        variant: "destructive"
      });
    }
  }, [addonsError, toast]);

  // addons is already defined above

  // Fetch side dishes using React Query
  const { data: sideDishesData, isLoading: isLoadingSideDishes, error: sideDishesError } = useQuery<MenuSideDish[], Error>({
    queryKey: ['menuSideDishes'],
    queryFn: MenuService.getAllMenuSideDishes,
    enabled: requiresSideDish,
  });

  // Handle side dishes errors with useEffect
  useEffect(() => {
    if (sideDishesError) {
      console.error("Error fetching side dishes:", sideDishesError);
      toast({
        title: "Error",
        description: "Failed to load side dishes",
        variant: "destructive"
      });
    }
  }, [sideDishesError, toast]);

  // Use addons and sideDishes data after all useQuery calls
  const addons = addonsData || [];
  const sideDishes = sideDishesData || [];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value, type: inputType } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: inputType === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSwitchChange = (id: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [id]: checked
    }));
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
  };

  // Create menu item mutation
  const { mutate: createMenuItem, isPending, isError, isSuccess } = useMutation({
    mutationFn: async (menuData: any) => {
      // Find or create category
      let categoryId = 1; // Default category

      // Try to find existing category
      try {
        const categories = await MenuService.getAllMenuCategories();
        const existingCategory = categories.find(cat =>
          cat.name.toLowerCase() === selectedCategory.toLowerCase()
        );
        if (existingCategory) {
          categoryId = existingCategory.id;
        } else {
          // Create new category
          const newCategory = await MenuService.createMenuCategory({
            name: selectedCategory,
            description: `${selectedCategory} category`,
            prepArea: isBar ? 'BAR' : 'KITCHEN',
            isActive: true
          });
          categoryId = newCategory.id;
        }
      } catch (error) {
        console.error("Error handling category:", error);
        // Fallback to default category
        categoryId = 1;
      }

      // Prepare menu item data according to the schema
      const menuItemData = {
        name: menuData.name,
        description: menuData.description,
        price: menuData.price,
        cost: menuData.cost,
        prepTime: menuData.prepTime,
        calories: menuData.calories,
        servingSize: menuData.servingSize,
        isAvailable: menuData.available,
        prepArea: isBar ? 'BAR' : 'KITCHEN',
        categoryId: categoryId,
        featured: menuData.featured,
        seasonal: menuData.seasonal,
        ingredients: ingredients,
        allergens: selectedAllergens,
        dietaryOptions: selectedDietary,
        sideDishIds: selectedSideDishes.length > 0 ? selectedSideDishes : undefined,
        addonIds: selectedAddons.length > 0 ? selectedAddons : undefined,
        rating: 0, // Default rating
        hasAddons: hasAddons,
        requiresSideDish: requiresSideDish,
        addons: [], // Will be populated by the backend
        sideDishes: [],
        menuCategory: categories.find(cat => cat.name === selectedCategory) || {
          id: 1,
          name: selectedCategory,
          description: `${selectedCategory} category`,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      };

      return MenuService.createMenuItem(menuItemData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `${isBar ? "Bar item" : "Menu item"} created successfully!`,
        variant: "default"
      });

      // Reset form after successful creation
      setTimeout(() => {
        // Redirect back to menu page
        window.location.href = isKitchen ? "/kitchen/menu" : isBar ? "/bar/menu" : "/menu";
      }, 2000);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create menu item",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a name for the item",
        variant: "destructive"
      });
      return;
    }

    if (!selectedCategory) {
      toast({
        title: "Validation Error",
        description: "Please select a category",
        variant: "destructive"
      });
      return;
    }

    if (formData.price <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid price",
        variant: "destructive"
      });
      return;
    }

    // Create menu item
    createMenuItem({
      ...formData,
      category: selectedCategory
    });
  };


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

  const toggleAddon = (addonId: number) => {
    setSelectedAddons(prev =>
      prev.includes(addonId)
        ? prev.filter(id => id !== addonId)
        : [...prev, addonId]
    );
  };

  return (
    <MainLayout title={isBar ? "Add Bar Item" : "Add Menu Item"} subtitle={isBar ? "Create a new drink for your bar menu" : "Create a new dish for your menu"}>
      <div className="space-y-6 animate-fade-in max-w-3xl">
        {/* Status Feedback */}
        {isSuccess && (
          <div className="p-4 rounded-lg bg-green-50 border border-green-200 text-green-800">
            ✅ {isBar ? "Bar item" : "Menu item"} created successfully! Redirecting...
          </div>
        )}
        {isError && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-800">
            ❌ Error creating item. Please check the form and try again.
          </div>
        )}
        {/* Back Button */}
        <Link to={isKitchen ? "/kitchen/menu" : isBar ? "/bar/menu" : "/menu"}>
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to {isKitchen ? "Kitchen" : isBar ? "Bar" : "Main"} Menu
          </Button>
        </Link>

        <form onSubmit={handleSubmit} className="grid gap-6">
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
                  <Input id="name" placeholder={isBar ? "e.g., Mojito" : "e.g., Grilled Salmon"} value={formData.name} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={selectedCategory} onValueChange={handleCategoryChange} disabled={isLoadingCategories}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder={isLoadingCategories ? "Loading categories..." : "Select category"} />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingCategories ? (
                        <div className="py-2 px-3 text-sm text-muted-foreground">
                          Loading categories...
                        </div>
                      ) : filteredCategories.length > 0 ? (
                        filteredCategories.map(cat => (
                          <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                        ))
                      ) : (
                        <div className="py-2 px-3 text-sm text-muted-foreground">
                          No categories available
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3 mt-4">
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30">
                    <Switch
                      id="hasAddons"
                      checked={hasAddons}
                      onCheckedChange={setHasAddons}
                    />
                    <Label htmlFor="hasAddons" className="cursor-pointer">
                      <span className="font-medium">Supports Addons</span>
                      <p className="text-sm text-muted-foreground">
                        Allow customers to add extras (e.g., extra cheese, bacon)
                      </p>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30">
                    <Switch
                      id="requiresSideDish"
                      checked={requiresSideDish}
                      onCheckedChange={setRequiresSideDish}
                    />
                    <Label htmlFor="requiresSideDish" className="cursor-pointer">
                      <span className="font-medium">Requires Side Dish</span>
                      <p className="text-sm text-muted-foreground">
                        Customers must select side dishes with this item
                      </p>
                    </Label>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea id="description" placeholder={isBar ? "Describe the drink, ingredients, and serving style..." : "Describe the dish, preparation, and presentation..."} rows={3} value={formData.description} onChange={handleInputChange} />
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

          {/* Side Dishes section removed - we use the required side dishes section below */}

          {/* Addons Selection Card - shown when hasAddons is checked */}
          {hasAddons && (
            <Card className="shadow-card border-border/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Plus className="h-5 w-5 text-primary" />
                  Addon Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingAddons ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <span className="ml-3">Loading addons...</span>
                  </div>
                ) : addons.length > 0 ? (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Select addons that can be added to this item (e.g., extra cheese, bacon, etc.)
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {addons.map(addon => (
                        <div
                          key={addon.id}
                          className={cn(
                            "flex items-center justify-between p-3 rounded-lg border border-border/50 cursor-pointer transition-all",
                            selectedAddons.includes(addon.id)
                              ? "bg-primary/10 border-primary/30"
                              : "hover:bg-muted/30"
                          )}
                          onClick={() => toggleAddon(addon.id)}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              id={`addon-${addon.id}`}
                              checked={selectedAddons.includes(addon.id)}
                              onChange={() => toggleAddon(addon.id)}
                              className="h-4 w-4 rounded border-border"
                              aria-label={`Include ${addon.name} as addon`}
                            />
                            <div>
                              <label htmlFor={`addon-${addon.id}`} className="cursor-pointer">
                                <p className="font-medium text-foreground">{addon.name}</p>
                                <p className="text-sm text-muted-foreground">${addon.price.toFixed(2)}</p>
                              </label>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {selectedAddons.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        <p className="text-sm font-medium text-foreground">Selected Addons:</p>
                        {selectedAddons.map(addonId => {
                          const addon = addons.find(a => a.id === addonId);
                          return (
                            <Badge key={addonId} variant="secondary" className="gap-1">
                              {addon?.name} (${addon?.price.toFixed(2)})
                            </Badge>
                          );
                        })}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No addons available</p>
                    <p className="text-sm mt-2">Addons can be created in the Menu Addons section</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Side Dishes Selection Card - shown when requiresSideDish is checked */}
          {requiresSideDish && (
            <Card className="shadow-card border-border/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <UtensilsCrossed className="h-5 w-5 text-primary" />
                  Side Dish Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingSideDishes ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <span className="ml-3">Loading side dishes...</span>
                  </div>
                ) : sideDishes.length > 0 ? (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Select side dishes that can be included with this item
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {sideDishes.map(sideDish => (
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
                          const sideDish = sideDishes.find(s => s.id === sideId);
                          return (
                            <Badge key={sideId} variant="secondary" className="gap-1">
                              {sideDish?.name} (${sideDish?.price.toFixed(2)})
                            </Badge>
                          );
                        })}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No side dishes available</p>
                    <p className="text-sm mt-2">Side dishes can be created in the Menu Side Dishes section</p>
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
                  <Input id="price" type="number" min="0" step="0.01" placeholder="0.00" value={formData.price} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cost">Cost ($)</Label>
                  <Input id="cost" type="number" min="0" step="0.01" placeholder={isBar ? "Liquor cost" : "Food cost"} value={formData.cost} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prepTime">{isBar ? "Prep Time (sec)" : "Prep Time (mins)"}</Label>
                  <Input id="prepTime" type="number" min="0" placeholder={isBar ? "30" : "15"} value={formData.prepTime} onChange={handleInputChange} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="calories">Calories</Label>
                  <Input id="calories" type="number" min="0" placeholder="Optional" value={formData.calories} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="servingSize">Serving Size</Label>
                  <Input id="servingSize" placeholder="e.g., 8 oz" value={formData.servingSize} onChange={handleInputChange} />
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
                <Switch id="available" checked={formData.available} onCheckedChange={(checked) => handleSwitchChange('available', checked)} />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                <div>
                  <Label htmlFor="featured" className="font-medium">Featured Item</Label>
                  <p className="text-sm text-muted-foreground">Highlight on menu and recommendations</p>
                </div>
                <Switch id="featured" checked={formData.featured} onCheckedChange={(checked) => handleSwitchChange('featured', checked)} />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                <div>
                  <Label htmlFor="seasonal" className="font-medium">Seasonal Item</Label>
                  <p className="text-sm text-muted-foreground">Limited time availability</p>
                </div>
                <Switch id="seasonal" checked={formData.seasonal} onCheckedChange={(checked) => handleSwitchChange('seasonal', checked)} />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Link to={isKitchen ? "/kitchen/menu" : isBar ? "/bar/menu" : "/menu"}>
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button
              type="submit"
              className="gradient-primary text-primary-foreground shadow-glow hover:shadow-lg transition-shadow"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <span className="animate-spin mr-2">🌀</span>
                  {isBar ? "Adding Bar Item..." : "Adding Menu Item..."}
                </>
              ) : (
                <>
                  <UtensilsCrossed className="h-4 w-4 mr-2" />
                  {isBar ? "Add Bar Item" : "Add Menu Item"}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}