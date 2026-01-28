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
import { ArrowLeft, Utensils, DollarSign, Tag } from 'lucide-react';
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
		isAvailable: true,
		categoryId: 0,
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
				isAvailable: menuItem.isAvailable,
				categoryId: menuItem.categoryId,
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

	const handleCategoryChange = (value: string) => {
		setSelectedCategory(value);
		const category = categories.find((cat) => cat.name === value);
		if (category) {
			setFormData((prev) => ({ ...prev, categoryId: category.id }));
		}
	};

	const handleSwitchChange = (checked: boolean) => {
		setFormData((prev) => ({ ...prev, isAvailable: checked }));
	};

	const updateMutation = useMutation({
		mutationFn: (data: Partial<MenuItem>) =>
			MenuService.updateMenuItem(Number(id), data),
		onSuccess: () => {
			toast({
				title: 'Success',
				description: 'Menu item updated successfully',
				variant: 'default',
			});
			navigate('/menu');
		},
		onError: (error: AxiosError<{ message?: string }>) => {
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
		updateMutation.mutate(formData);
	};

	if (isLoadingItem || isLoadingCategories) {
		return (
			<MainLayout
				title='Edit Menu Item'
				subtitle='Loading...'>
				<div className='flex justify-center items-center h-64'>
					<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
				</div>
			</MainLayout>
		);
	}

	return (
		<MainLayout
			title='Edit Menu Item'
			subtitle='Update menu item details'>
			<div className='max-w-2xl mx-auto space-y-6'>
				<Link to='/menu'>
					<Button
						variant='ghost'
						className='mb-4'>
						<ArrowLeft className='h-4 w-4 mr-2' />
						Back to Menu
					</Button>
				</Link>

				<Card>
					<CardHeader>
						<CardTitle className='flex items-center gap-2'>
							<Utensils className='h-5 w-5' />
							Edit Menu Item
						</CardTitle>
					</CardHeader>
					<CardContent>
						<form
							onSubmit={handleSubmit}
							className='space-y-6'>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								<div className='space-y-2'>
									<Label htmlFor='name'>Name</Label>
									<Input
										id='name'
										value={formData.name}
										onChange={handleInputChange}
										required
									/>
								</div>
								<div className='space-y-2'>
									<Label htmlFor='price'>Price</Label>
									<div className='relative'>
										<DollarSign className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
										<Input
											id='price'
											type='number'
											step='0.01'
											value={formData.price}
											onChange={handleInputChange}
											className='pl-9'
											required
										/>
									</div>
								</div>
							</div>

							<div className='space-y-2'>
								<Label htmlFor='description'>Description</Label>
								<Textarea
									id='description'
									value={formData.description}
									onChange={handleInputChange}
									rows={3}
								/>
							</div>

							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								<div className='space-y-2'>
									<Label>Category</Label>
									<Select
										value={selectedCategory}
										onValueChange={handleCategoryChange}>
										<SelectTrigger>
											<SelectValue placeholder='Select category' />
										</SelectTrigger>
										<SelectContent>
											{categories.map((category) => (
												<SelectItem
													key={category.id}
													value={category.name}>
													{category.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div className='space-y-2'>
									<Label>Availability</Label>
									<div className='flex items-center space-x-2'>
										<Switch
											checked={formData.isAvailable}
											onCheckedChange={handleSwitchChange}
										/>
										<span className='text-sm text-muted-foreground'>
											{formData.isAvailable ? 'Available' : 'Unavailable'}
										</span>
									</div>
								</div>
							</div>

							<div className='flex justify-end gap-4'>
								<Link to='/menu'>
									<Button
										type='button'
										variant='outline'>
										Cancel
									</Button>
								</Link>
								<Button
									type='submit'
									disabled={updateMutation.isPending}>
									{updateMutation.isPending ? 'Updating...' : 'Update Item'}
								</Button>
							</div>
						</form>
					</CardContent>
				</Card>
			</div>
		</MainLayout>
	);
}
