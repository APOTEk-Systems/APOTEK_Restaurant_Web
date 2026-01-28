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
import { ArrowLeft, GlassWater, DollarSign, Tag } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { MenuService } from '@/services/menuService';
import { useToast } from '@/hooks/use-toast';
import { AxiosError } from 'axios';

// Import types from menu service
import { MenuCategory, MenuItem } from '@/types/menuType';

export default function MenuEdit() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const [selectedCategory, setSelectedCategory] = useState<string>('');
	const [formData, setFormData] = useState({
		name: '',
		description: '',
		price: 0,
		available: true,
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

	// Populate form when menu item is loaded
	useEffect(() => {
		if (menuItem) {
			setFormData({
				name: menuItem.name,
				description: menuItem.description || '',
				price: menuItem.price,
				available: menuItem.isAvailable,
			});
			setSelectedCategory(menuItem.menuCategory?.name || '');
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
	}, [itemError, categoriesError, toast]);

	const categories = categoriesData || [];

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
				isAvailable: menuData.available,
				categoryId: category.id,
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
				navigate('/bar/menu');
			}, 2000);
		},
		onError: (error: AxiosError) => {
			toast({
				title: 'Error',
				description:
					(error.response?.data as { message?: string })?.message ||
					'Failed to update menu item',
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
					<Link to='/bar/menu'>
						<Button
							variant='outline'
							className='mt-4'>
							Back to Bar Menu
						</Button>
					</Link>
				</div>
			</MainLayout>
		);
	}

	return (
		<MainLayout
			title='Edit Bar Menu Item'
			subtitle='Update the details of your bar menu item'>
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
				<Link to='/bar/menu'>
					<Button
						variant='ghost'
						className='gap-2'>
						<ArrowLeft className='h-4 w-4' />
						Back to Bar Menu
					</Button>
				</Link>

				<form
					onSubmit={handleSubmit}
					className='grid gap-6'>
					{/* Basic Information */}
					<Card className='shadow-card border-border/50'>
						<CardHeader>
							<CardTitle className='text-lg flex items-center gap-2'>
								<GlassWater className='h-5 w-5 text-primary' />
								Drink Information
							</CardTitle>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
								<div className='space-y-2'>
									<Label htmlFor='name'>Drink Name *</Label>
									<Input
										id='name'
										placeholder='e.g., Mojito'
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
													.filter((cat) => cat.prepArea === 'BAR')
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
									placeholder='Describe the drink...'
									value={formData.description}
									onChange={handleInputChange}
									rows={3}
								/>
							</div>
							<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
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
									<Label htmlFor='available'>Available</Label>
									<div className='flex items-center space-x-2'>
										<Switch
											id='available'
											checked={formData.available}
											onCheckedChange={(checked) =>
												handleSwitchChange('available', checked)
											}
										/>
										<span className='text-sm text-muted-foreground'>
											{formData.available ? 'Available' : 'Unavailable'}
										</span>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Submit Button */}
					<div className='flex justify-end'>
						<Button
							type='submit'
							disabled={isPending}
							className='gradient-primary text-primary-foreground shadow-glow hover:shadow-lg transition-shadow'>
							{isPending ? 'Updating...' : 'Update Item'}
						</Button>
					</div>
				</form>
			</div>
		</MainLayout>
	);
}
