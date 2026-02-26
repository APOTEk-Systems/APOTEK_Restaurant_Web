import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, UtensilsCrossed, DollarSign, Clock, Tag, Plus, X, Loader2 } from "lucide-react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MenuService } from "@/services/menuService";
import { useToast } from "@/hooks/use-toast";
import { MenuCategory, MenuAddon, MenuSideDish } from "@/services/menuService";

const allergens = ["Gluten", "Dairy", "Nuts", "Shellfish", "Eggs", "Soy", "Fish"];
const dietaryOptions = ["Vegetarian", "Vegan", "Gluten-Free", "Keto", "Low-Carb", "Dairy-Free"];

export default function MenuNew() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Check if we're in edit mode
  const editId = searchParams.get('id');
  const isEditMode = !!editId;
  const type = searchParams.get('type');
  const isKitchen = type === 'kitchen';
  const isBar = type === 'bar';

  // State for form fields
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [newIngredient, setNewIngredient] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSideDishes, setSelectedSideDishes] = useState<number[]>([]);
  const [selectedAddons, setSelectedAddons] = useState<number[]>([]);
  const [hasAddons, setHasAddons] = useState(false);
  const [requiresSideDish, setRequiresSideDish] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "" as any,
    cost: "" as any,
    prepTime: "" as any,
    calories: "" as any,
    servingSize: "",
    available: true,
    featured: false,
    seasonal: false
  });

  // Fetch categories using React Query
  const { data: categoriesData, isLoading: isLoadingCategories } = useQuery<MenuCategory[], Error>({
    queryKey: ['menuCategories'],
    queryFn: MenuService.getAllMenuCategories,
  });

  // Fetch addons using React Query (always fetch but not used unless hasAddons is true)
  const { data: addonsData } = useQuery<MenuAddon[], Error>({
    queryKey: ['menuAddons'],
    queryFn: MenuService.getAllMenuAddons,
  });

  // Fetch side dishes using React Query
  const { data: sideDishesData } = useQuery<MenuSideDish[], Error>({
    queryKey: ['menuSideDishes'],
    queryFn: MenuService.getAllMenuSideDishes,
  });

  // Fetch menu item data if in edit mode
  const { data: menuItemData, isLoading: isLoadingMenuItem } = useQuery({
    queryKey: ['menuItem', editId],
    queryFn: () => MenuService.getMenuItemById(parseInt(editId!)),
    enabled: isEditMode && !!editId,
  });

  // Populate form with existing data when in edit mode
  useEffect(() => {
    if (menuItemData) {
      setFormData({
        name: menuItemData.name || "",
        description: menuItemData.description || "",
        price: menuItemData.price || 0,
        cost: menuItemData.cost || 0,
        prepTime: menuItemData.prepTime || 0,
        calories: menuItemData.calories || 0,
        servingSize: menuItemData.servingSize || "",
        available: menuItemData.isAvailable ?? true,
        featured: menuItemData.featured || false,
        seasonal: menuItemData.seasonal || false,
      });
      setSelectedAllergens(menuItemData.allergens || []);
      setSelectedDietary(menuItemData.dietaryOptions || []);
      setIngredients(menuItemData.ingredients || []);
      setHasAddons(menuItemData.hasAddons || false);
      setRequiresSideDish(menuItemData.requiresSideDish || false);
      
      // Set selected category
      if (categoriesData && menuItemData.menuCategory) {
        setSelectedCategory(menuItemData.menuCategory.name);
      }
      
      // Set selected side dishes and addons from the item
      if (menuItemData.sideDishes) {
        setSelectedSideDishes(menuItemData.sideDishes.map((sd: any) => sd.id));
      }
      if (menuItemData.addons) {
        setSelectedAddons(menuItemData.addons.map((a: any) => a.id));
      }
    }
  }, [menuItemData, categoriesData]);

  // Set default category when categories load
  useEffect(() => {
    if (categoriesData && !selectedCategory && !isEditMode) {
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
  }, [categoriesData, isKitchen, isBar, selectedCategory, isEditMode]);

  // Use data
  const categories = categoriesData || [];
  const addons = addonsData || [];
  const sideDishes = sideDishesData || [];

  // Filter categories based on prep area
  const filteredCategories = categories.filter(category => {
    if (isKitchen) return category.prepArea === 'KITCHEN';
    if (isBar) return category.prepArea === 'BAR';
    return true;
  });

  // Create/update menu item mutation
  const { mutate: saveMenuItem, isPending } = useMutation({
    mutationFn: async (menuData: typeof formData) => {
      // Find category ID
      let categoryId = 1;
      try {
        const categories = await MenuService.getAllMenuCategories();
        const existingCategory = categories.find(cat =>
          cat.name.toLowerCase() === selectedCategory.toLowerCase()
        );
        if (existingCategory) {
          categoryId = existingCategory.id;
        } else {
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
        categoryId = 1;
      }

      const menuItemData = {
        name: menuData.name,
        description: menuData.description,
        price: menuData.price,
        cost: menuData.cost,
        prepTime: menuData.prepTime,
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
        hasAddons: hasAddons,
        requiresSideDish: requiresSideDish,
      };

      if (isEditMode && editId) {
        return MenuService.updateMenuItem(parseInt(editId), menuItemData);
      } else {
        return MenuService.createMenuItem(menuItemData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menuItems"] });
      toast({
        title: "Success",
        description: isEditMode 
          ? `${isBar ? "Bar item" : "Menu item"} updated successfully!`
          : `${isBar ? "Bar item" : "Menu item"} created successfully!`,
        variant: "default"
      });
      
      // Redirect back to menu page
      setTimeout(() => {
        navigate(isKitchen ? "/kitchen/menu" : isBar ? "/bar/menu" : "/menu");
      }, 1500);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} menu item`,
        variant: "destructive"
      });
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value, type: inputType } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: inputType === 'number' ? (value === "" ? "" : parseFloat(value)) : value
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

    if (!formData.price || formData.price <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid price",
        variant: "destructive"
      });
      return;
    }

    saveMenuItem(formData);
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

  // const addIngredient = () => {
  //   if (newIngredient.trim() && !ingredients.includes(newIngredient.trim())) {
  //     setIngredients([...ingredients, newIngredient.trim()]);
  //     setNewIngredient("");
  //   }
  // };

  // const removeIngredient = (ingredient: string) => {
  //   setIngredients(ingredients.filter(i => i !== ingredient));
  // };

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

  // Loading state for edit mode
  if (isEditMode && isLoadingMenuItem) {
    return (
      <MainLayout title={isBar ? "Edit Bar Item" : "Edit Menu Item"} subtitle="Loading item details...">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Loading...</span>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout 
      title={isEditMode 
        ? (isBar ? "Edit Bar Item" : "Edit Menu Item") 
        : (isBar ? "Add Bar Item" : "Add Menu Item")
      } 
      subtitle={isEditMode 
        ? "Update item details" 
        : (isBar ? "Create a new drink for your bar menu" : "Create a new dish for your menu")
      }
    >
      <div className="space-y-6 animate-fade-in max-w-3xl">
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
                  <Input 
                    id="name" 
                    placeholder={isBar ? "e.g., Mojito" : "e.g., Grilled Salmon"} 
                    value={formData.name} 
                    onChange={handleInputChange} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={selectedCategory} onValueChange={handleCategoryChange} disabled={isLoadingCategories}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder={isLoadingCategories ? "Loading..." : "Select category"} />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingCategories ? (
                        <div className="py-2 px-3 text-sm text-muted-foreground">Loading...</div>
                      ) : filteredCategories.length > 0 ? (
                        filteredCategories.map(cat => (
                          <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                        ))
                      ) : (
                        <div className="py-2 px-3 text-sm text-muted-foreground">No categories</div>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                {!isBar && (
                  <div className="space-y-3 mt-4">
                    <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30">
                      <Switch
                        id="hasAddons"
                        checked={hasAddons}
                        onCheckedChange={setHasAddons}
                      />
                      <Label htmlFor="hasAddons" className="cursor-pointer">
                        <span className="font-medium">Supports Addons</span>
                        <p className="text-sm text-muted-foreground">Allow customers to add extras</p>
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
                        <p className="text-sm text-muted-foreground">Customers must select side dishes</p>
                      </Label>
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea 
                  id="description" 
                  placeholder={isBar ? "Describe the drink..." : "Describe the dish..."} 
                  rows={3} 
                  value={formData.description} 
                  onChange={handleInputChange} 
                />
              </div>
              {/* <div className="space-y-2">
                <Label>{isBar ? "Ingredients" : "Ingredients"}</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder={isBar ? "Add ingredient" : "Add ingredient"}
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
              </div> */}
            </CardContent>
          </Card>

          {/* Addons Selection Card */}
          {hasAddons && (
            <Card className="shadow-card border-border/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Plus className="h-5 w-5 text-primary" />
                  Addon Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {addons.length > 0 ? (
                  <>
                    <p className="text-sm text-muted-foreground">Select addons that can be added to this item</p>
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
                        <p className="text-sm font-medium text-foreground">Selected:</p>
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
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Side Dishes Selection Card */}
          {requiresSideDish && (
            <Card className="shadow-card border-border/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <UtensilsCrossed className="h-5 w-5 text-primary" />
                  Side Dish Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {sideDishes.length > 0 ? (
                  <>
                    <p className="text-sm text-muted-foreground">Select side dishes for this item</p>
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
                              id={`side-${sideDish.id}`}
                              checked={selectedSideDishes.includes(sideDish.id)}
                              onChange={() => toggleSideDish(sideDish.id)}
                              className="h-4 w-4 rounded border-border"
                            />
                            <div>
                              <label htmlFor={`side-${sideDish.id}`} className="cursor-pointer">
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
                        <p className="text-sm font-medium text-foreground">Selected:</p>
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
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    
                    placeholder="0.00"
                    value={formData.price}
                    onChange={handleInputChange}
                    onFocus={(e) => e.target.select()}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cost">Cost ($)</Label>
                  <Input
                    id="cost"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder={isBar ? "0.00" : "0.00"}
                    value={formData.cost}
                    onChange={handleInputChange}
                    onFocus={(e) => e.target.select()}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prepTime">{isBar ? "Prep Time (sec)" : "Prep Time (mins)"}</Label>
                  <Input
                    id="prepTime"
                    type="number"
                    min="0"
                    placeholder={isBar ? "30" : "15"}
                    value={formData.prepTime}
                    onChange={handleInputChange}
                    onFocus={(e) => e.target.select()}
                  />
                </div>
              </div>
              {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="calories">Calories</Label>
                  <Input
                    id="calories"
                    type="number"
                    min="0"
                    placeholder="Optional"
                    value={formData.calories}
                    onChange={handleInputChange}
                    onFocus={(e) => e.target.select()}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="servingSize">Serving Size</Label>
                  <Input 
                    id="servingSize" 
                    placeholder="e.g., 8 oz" 
                    value={formData.servingSize} 
                    onChange={handleInputChange} 
                  />
                </div>
              </div> */}
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
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isEditMode ? "Saving..." : "Creating..."}
                </>
              ) : (
                <>
                  <UtensilsCrossed className="h-4 w-4 mr-2" />
                  {isEditMode ? "Save Changes" : (isBar ? "Add Bar Item" : "Add Menu Item")}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}