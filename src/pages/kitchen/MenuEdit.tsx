import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
	ArrowLeft,
	UtensilsCrossed,
	DollarSign,
	Clock,
	Tag,
	Plus,
	X,
} from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useMutation, useQuery } from '@tanstack/react-query';
import { MenuService } from '@/services/menuService';
import { useToast } from '@/hooks/use-toast';
import { AxiosError } from 'axios';

// Import types from menu service
import {
	MenuCategory,
	MenuAddon,
	MenuSideDish,
	MenuItem,
} from '@/types/menuType';

const allergens = [
	'Gluten',
	'Dairy',
	'Nuts',
	'Shellfish',
	'Eggs',
	'Soy',
	'Fish',
];
const dietaryOptions = [
	'Vegetarian',
	'Vegan',
	'Gluten-Free',
	'Keto',
	'Low-Carb',
	'Dairy-Free',
];

export default function MenuEdit() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
	const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
	const [ingredients, setIngredients] = useState<string[]>([]);
	const [newIngredient, setNewIngredient] = useState('');
	const [selectedCategory, setSelectedCategory] = useState<string>('');
	const [selectedSideDishes, setSelectedSideDishes] = useState<number[]>([]);
	const [selectedAddons, setSelectedAddons] = useState<number[]>([]);
	const [hasAddons, setHasAddons] = useState(false);
	const [requiresSideDish, setRequiresSideDish] = useState(false);
	const [formData, setFormData] = useState({
		name: '',
		description: '',
		price: 0,
		cost: 0,
		prepTime: 0,
		calories: 0,
		servingSize: '',
		available: true,
		featured: false,
		seasonal: false,
	});
	const { toast } = useToast();

	// Fetch the menu item to edit
	const {
		data: menuItem,
		isLoading: isLoadingItem,
		error: itemError,
	} = useQuery<MenuItem, Error>({
		queryKey: ['menuItem', id],
		queryFn: () => MenuService.getMenuItemById(Number(id)),
		enabled: !!id,
	});

	// Fetch categories using React Query
	const {
		data: categoriesData,
		isLoading: isLoadingCategories,
		error: categoriesError,
	} = useQuery<MenuCategory[], Error>({
		queryKey: ['menuCategories'],
		queryFn: MenuService.getAllMenuCategories,
	});

	// Fetch addons using React Query
	const {
		data: addonsData,
		isLoading: isLoadingAddons,
		error: addonsError,
	} = useQuery<MenuAddon[], Error>({
		queryKey: ['menuAddons'],
		queryFn: MenuService.getAllMenuAddons,
		enabled: hasAddons,
	});

	// Fetch side dishes using React Query
	const {
		data: sideDishesData,
		isLoading: isLoadingSideDishes,
		error: sideDishesError,
	} = useQuery<MenuSideDish[], Error>({
		queryKey: ['menuSideDishes'],
		queryFn: MenuService.getAllMenuSideDishes,
		enabled: requiresSideDish,
	});

	// Populate form when menu item is loaded
	useEffect(() => {
		if (menuItem) {
			setFormData({
				name: menuItem.name,
				description: menuItem.description || '',
				price: menuItem.price,
				cost: menuItem.cost || 0,
				prepTime: menuItem.prepTime || 0,
				calories: menuItem.calories || 0,
				servingSize: menuItem.servingSize || '',
				available: menuItem.isAvailable,
				featured: menuItem.featured,
				seasonal: menuItem.seasonal,
			});
			setSelectedCategory(menuItem.menuCategory?.name || '');
			setSelectedAllergens(menuItem.allergens || []);
			setSelectedDietary(menuItem.dietaryOptions || []);
			setIngredients(menuItem.ingredients || []);
			setHasAddons(menuItem.hasAddons);
			setRequiresSideDish(menuItem.requiresSideDish);
			setSelectedSideDishes(menuItem.sideDishes?.map((sd) => sd.id) || []);
			setSelectedAddons(menuItem.addons?.map((a) => a.id) || []);
		}
	}, [menuItem]);

	// Handle errors
	useEffect(() => {
		if (itemError) {
			toast({
				title: 'Error',
				description: 'Failed to load menu item',
				variant: 'destructive',
			});
		}
		if (categoriesError) {
			toast({
				title: 'Error',
				description: 'Failed to load categories',
				variant: 'destructive',
			});
		}
		if (addonsError) {
			toast({
				title: 'Error',
				description: 'Failed to load addons',
				variant: 'destructive',
			});
		}
		if (sideDishesError) {
			toast({
				title: 'Error',
				description: 'Failed to load side dishes',
				variant: 'destructive',
			});
		}
	}, [itemError, categoriesError, addonsError, sideDishesError, toast]);

	const categories = categoriesData || [];
	const addons = addonsData || [];
	const sideDishes = sideDishesData || [];

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		const { id, value, type: inputType } = e.target;
		setFormData((prev) => ({
			...prev,
			[id]: inputType === 'number' ? parseFloat(value) || 0 : value,
		}));
	};

	const handleSwitchChange = (id: string, checked: boolean) => {
		setFormData((prev) => ({
			...prev,
			[id]: checked,
		}));
	};

	const handleCategoryChange = (value: string) => {
		setSelectedCategory(value);
	};

	// Update menu item mutation
	const {
		mutate: updateMenuItem,
		isPending,
		isError,
		isSuccess,
	} = useMutation({
		mutationFn: async (menuData: typeof formData) => {
			if (!menuItem) throw new Error('Menu item not found');

			// Find category ID
			const category = categories.find((cat) => cat.name === selectedCategory);
			if (!category) throw new Error('Category not found');

			const updateData = {
				name: menuData.name,
				description: menuData.description,
				price: menuData.price,
				cost: menuData.cost,
				prepTime: menuData.prepTime,
				calories: menuData.calories,
				servingSize: menuData.servingSize,
				isAvailable: menuData.available,
				categoryId: category.id,
				featured: menuData.featured,
				seasonal: menuData.seasonal,
				ingredients: ingredients,
				allergens: selectedAllergens,
				dietaryOptions: selectedDietary,
				hasAddons: hasAddons,
				requiresSideDish: requiresSideDish,
			};

			return MenuService.updateMenuItem(menuItem.id, updateData);
		},
		onSuccess: () => {
			toast({
				title: 'Success',
				description: 'Menu item updated successfully!',
				variant: 'default',
			});
			setTimeout(() => {
				navigate('/kitchen/menu');
			}, 2000);
		},
		onError: (error: AxiosError) => {
			toast({
				title: 'Error',
				description:
					error.response?.data?.message || 'Failed to update menu item',
				variant: 'destructive',
			});
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		// Basic validation
		if (!formData.name.trim()) {
			toast({
				title: 'Validation Error',
				description: 'Please enter a name for the item',
				variant: 'destructive',
			});
			return;
		}

		if (!selectedCategory) {
			toast({
				title: 'Validation Error',
				description: 'Please select a category',
				variant: 'destructive',
			});
			return;
		}

		if (formData.price <= 0) {
			toast({
				title: 'Validation Error',
				description: 'Please enter a valid price',
				variant: 'destructive',
			});
			return;
		}

		// Update menu item
		updateMenuItem(formData);
	};

	const toggleAllergen = (allergen: string) => {
		setSelectedAllergens((prev) =>
			prev.includes(allergen)
				? prev.filter((a) => a !== allergen)
				: [...prev, allergen],
		);
	};

	const toggleDietary = (option: string) => {
		setSelectedDietary((prev) =>
			prev.includes(option)
				? prev.filter((o) => o !== option)
				: [...prev, option],
		);
	};

	const addIngredient = () => {
		if (newIngredient.trim() && !ingredients.includes(newIngredient.trim())) {
			setIngredients([...ingredients, newIngredient.trim()]);
			setNewIngredient('');
		}
	};

	const removeIngredient = (ingredient: string) => {
		setIngredients(ingredients.filter((i) => i !== ingredient));
	};

	const toggleSideDish = (sideDishId: number) => {
		setSelectedSideDishes((prev) =>
			prev.includes(sideDishId)
				? prev.filter((id) => id !== sideDishId)
				: [...prev, sideDishId],
		);
	};

	const toggleAddon = (addonId: number) => {
		setSelectedAddons((prev) =>
			prev.includes(addonId)
				? prev.filter((id) => id !== addonId)
				: [...prev, addonId],
		);
	};

	if (isLoadingItem) {
		return (
			<MainLayout
				title='Edit Menu Item'
				subtitle='Loading...'>
				<div className='flex justify-center items-center py-12'>
					<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary'></div>
				</div>
			</MainLayout>
		);
	}

	if (itemError || !menuItem) {
		return (
			<MainLayout
				title='Edit Menu Item'
				subtitle='Error'>
				<div className='p-6 rounded-lg bg-red-50 border border-red-200 text-red-800'>
					<p className='font-medium'>❌ Error loading menu item</p>
					<p className='mt-2'>The menu item could not be found or loaded.</p>
					<Link to='/kitchen/menu'>
						<Button
							variant='outline'
							className='mt-4'>
							Back to Kitchen Menu
						</Button>
					</Link>
				</div>
			</MainLayout>
		);
	}

	return (
		<MainLayout
			title='Edit Menu Item'
			subtitle='Update the details of your kitchen menu item'>
			<div className='space-y-6 animate-fade-in max-w-3xl'>
				{/* Status Feedback */}
				{isSuccess && (
					<div className='p-4 rounded-lg bg-green-50 border border-green-200 text-green-800'>
						✅ Menu item updated successfully! Redirecting...
					</div>
				)}
				{isError && (
					<div className='p-4 rounded-lg bg-red-50 border border-red-200 text-red-800'>
						❌ Error updating item. Please check the form and try again.
					</div>
				)}
				{/* Back Button */}
				<Link to='/kitchen/menu'>
					<Button
						variant='ghost'
						className='gap-2'>
						<ArrowLeft className='h-4 w-4' />
						Back to Kitchen Menu
					</Button>
				</Link>

				<form
					onSubmit={handleSubmit}
					className='grid gap-6'>
					{/* Basic Information */}
					<Card className='shadow-card border-border/50'>
						<CardHeader>
							<CardTitle className='text-lg flex items-center gap-2'>
								<UtensilsCrossed className='h-5 w-5 text-primary' />
								Dish Information
							</CardTitle>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
								<div className='space-y-2'>
									<Label htmlFor='name'>Dish Name *</Label>
									<Input
										id='name'
										placeholder='e.g., Grilled Salmon'
										value={formData.name}
										onChange={handleInputChange}
									/>
								</div>
								<div className='space-y-2'>
									<Label htmlFor='category'>Category *</Label>
									<Select
										value={selectedCategory}
										onValueChange={handleCategoryChange}
										disabled={isLoadingCategories}>
										<SelectTrigger id='category'>
											<SelectValue
												placeholder={
													isLoadingCategories
														? 'Loading categories...'
														: 'Select category'
												}
											/>
										</SelectTrigger>
										<SelectContent>
											{isLoadingCategories ? (
												<div className='py-2 px-3 text-sm text-muted-foreground'>
													Loading categories...
												</div>
											) : categories.length > 0 ? (
												categories
													.filter((cat) => cat.prepArea === 'KITCHEN')
													.map((cat) => (
														<SelectItem
															key={cat.id}
															value={cat.name}>
															{cat.name}
														</SelectItem>
													))
											) : (
												<div className='py-2 px-3 text-sm text-muted-foreground'>
													No categories available
												</div>
											)}
										</SelectContent>
									</Select>
								</div>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='description'>Description</Label>
								<Textarea
									id='description'
									placeholder='Describe the dish...'
									value={formData.description}
									onChange={handleInputChange}
									rows={3}
								/>
							</div>
							<div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
								<div className='space-y-2'>
									<Label
										htmlFor='price'
										className='flex items-center gap-1'>
										<DollarSign className='h-4 w-4' />
										Price *
									</Label>
									<Input
										id='price'
										type='number'
										step='0.01'
										min='0'
										placeholder='0.00'
										value={formData.price}
										onChange={handleInputChange}
									/>
								</div>
								<div className='space-y-2'>
									<Label htmlFor='cost'>Cost</Label>
									<Input
										id='cost'
										type='number'
										step='0.01'
										min='0'
										placeholder='0.00'
										value={formData.cost}
										onChange={handleInputChange}
									/>
								</div>
								<div className='space-y-2'>
									<Label
										htmlFor='prepTime'
										className='flex items-center gap-1'>
										<Clock className='h-4 w-4' />
										Prep Time (min)
									</Label>
									<Input
										id='prepTime'
										type='number'
										min='0'
										placeholder='0'
										value={formData.prepTime}
										onChange={handleInputChange}
									/>
								</div>
							</div>
							<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
								<div className='space-y-2'>
									<Label htmlFor='calories'>Calories</Label>
									<Input
										id='calories'
										type='number'
										min='0'
										placeholder='0'
										value={formData.calories}
										onChange={handleInputChange}
									/>
								</div>
								<div className='space-y-2'>
									<Label htmlFor='servingSize'>Serving Size</Label>
									<Input
										id='servingSize'
										placeholder='e.g., 200g'
										value={formData.servingSize}
										onChange={handleInputChange}
									/>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Availability & Features */}
					<Card className='shadow-card border-border/50'>
						<CardHeader>
							<CardTitle className='text-lg flex items-center gap-2'>
								<Tag className='h-5 w-5 text-primary' />
								Availability & Features
							</CardTitle>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='flex items-center justify-between'>
								<div className='space-y-0.5'>
									<Label htmlFor='available'>Available</Label>
									<p className='text-sm text-muted-foreground'>
										Make this item available for ordering
									</p>
								</div>
								<Switch
									id='available'
									checked={formData.available}
									onCheckedChange={(checked) =>
										handleSwitchChange('available', checked)
									}
								/>
							</div>
							<div className='flex items-center justify-between'>
								<div className='space-y-0.5'>
									<Label htmlFor='featured'>Featured</Label>
									<p className='text-sm text-muted-foreground'>
										Highlight this item on the menu
									</p>
								</div>
								<Switch
									id='featured'
									checked={formData.featured}
									onCheckedChange={(checked) =>
										handleSwitchChange('featured', checked)
									}
								/>
							</div>
							<div className='flex items-center justify-between'>
								<div className='space-y-0.5'>
									<Label htmlFor='seasonal'>Seasonal</Label>
									<p className='text-sm text-muted-foreground'>
										Mark as seasonal special
									</p>
								</div>
								<Switch
									id='seasonal'
									checked={formData.seasonal}
									onCheckedChange={(checked) =>
										handleSwitchChange('seasonal', checked)
									}
								/>
							</div>
						</CardContent>
					</Card>

					{/* Ingredients */}
					<Card className='shadow-card border-border/50'>
						<CardHeader>
							<CardTitle className='text-lg'>Ingredients</CardTitle>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='flex gap-2'>
								<Input
									placeholder='Add ingredient...'
									value={newIngredient}
									onChange={(e) => setNewIngredient(e.target.value)}
									onKeyPress={(e) =>
										e.key === 'Enter' && (e.preventDefault(), addIngredient())
									}
								/>
								<Button
									type='button'
									onClick={addIngredient}
									size='icon'>
									<Plus className='h-4 w-4' />
								</Button>
							</div>
							<div className='flex flex-wrap gap-2'>
								{ingredients.map((ingredient) => (
									<Badge
										key={ingredient}
										variant='secondary'
										className='gap-1'>
										{ingredient}
										<Button
											type='button'
											variant='ghost'
											size='icon'
											className='h-4 w-4 p-0 hover:bg-transparent'
											onClick={() => removeIngredient(ingredient)}>
											<X className='h-3 w-3' />
										</Button>
									</Badge>
								))}
							</div>
						</CardContent>
					</Card>

					{/* Allergens & Dietary */}
					<Card className='shadow-card border-border/50'>
						<CardHeader>
							<CardTitle className='text-lg'>
								Allergens & Dietary Options
							</CardTitle>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='space-y-2'>
								<Label>Allergens</Label>
								<div className='flex flex-wrap gap-2'>
									{allergens.map((allergen) => (
										<Badge
											key={allergen}
											variant={
												selectedAllergens.includes(allergen)
													? 'default'
													: 'outline'
											}
											className='cursor-pointer'
											onClick={() => toggleAllergen(allergen)}>
											{allergen}
										</Badge>
									))}
								</div>
							</div>
							<div className='space-y-2'>
								<Label>Dietary Options</Label>
								<div className='flex flex-wrap gap-2'>
									{dietaryOptions.map((option) => (
										<Badge
											key={option}
											variant={
												selectedDietary.includes(option) ? 'default' : 'outline'
											}
											className='cursor-pointer'
											onClick={() => toggleDietary(option)}>
											{option}
										</Badge>
									))}
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Submit Button */}
					<div className='flex justify-end gap-4'>
						<Link to='/kitchen/menu'>
							<Button
								variant='outline'
								type='button'>
								Cancel
							</Button>
						</Link>
						<Button
							type='submit'
							disabled={isPending}
							className='gradient-primary'>
							{isPending ? 'Updating...' : 'Update Item'}
						</Button>
					</div>
				</form>
			</div>
		</MainLayout>
	);
}
