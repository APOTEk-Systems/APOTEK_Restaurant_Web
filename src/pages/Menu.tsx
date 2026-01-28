import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Edit, Trash2, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link, useNavigate } from 'react-router-dom';
import { AddSideDishDialog } from '@/components/menu/AddSideDishDialog';
import { AddAddonDialog } from '@/components/menu/AddAddonDialog';
import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MenuService } from '@/services/menuService';
import {
	MenuItem,
	MenuAddon,
	MenuSideDish,
	MenuCategory,
} from '@/types/menuType';
import { useToast } from '@/hooks/use-toast';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// Menu Item Card Component
function MenuItemCard({
	item,
	categoryName,
	onEdit,
	onDelete,
}: {
	item: MenuItem;
	categoryName?: string;
	onEdit: (id: number) => void;
	onDelete: (id: number) => void;
}) {
	return (
		<div
			className={cn(
				'bg-card rounded-xl p-5 shadow-card border border-border/50 hover:shadow-card-hover transition-all duration-300 hover-lift',
				!item.isAvailable && 'opacity-60',
			)}>
			<div className='flex items-start justify-between mb-3'>
				<div className='flex-1'>
					<div className='flex items-center gap-2'>
						<h3 className='font-semibold text-foreground'>{item.name}</h3>
						{!item.isAvailable && (
							<Badge
								variant='secondary'
								className='text-xs'>
								Unavailable
							</Badge>
						)}
					</div>
					<p className='text-sm text-muted-foreground mt-1'>
						{item.description}
					</p>
					{categoryName && (
						<Badge
							variant='outline'
							className='mt-2 text-xs'>
							{categoryName}
						</Badge>
					)}
				</div>
				<span className='text-lg font-bold text-primary'>
					{item.price.toLocaleString('en-US')}
				</span>
			</div>
			<div className='flex items-center justify-between'>
				<div className='flex items-center gap-4 text-sm text-muted-foreground'>
					{item.rating && (
						<span className='flex items-center gap-1'>
							<Star className='h-4 w-4 text-warning fill-warning' />
							{item.rating}
						</span>
					)}
				</div>
				<div className='flex items-center gap-1'>
					<Button
						variant='ghost'
						size='icon'
						className='h-8 w-8'
						onClick={() => onEdit(item.id)}>
						<Edit className='h-4 w-4' />
					</Button>
					<Button
						variant='ghost'
						size='icon'
						className='h-8 w-8 text-destructive hover:text-destructive'
						onClick={() => onDelete(item.id)}>
						<Trash2 className='h-4 w-4' />
					</Button>
				</div>
			</div>
			{item.requiresSideDish && (
				<div className='mt-2'>
					<Badge
						variant='secondary'
						className='text-xs'>
						Comes with side dish
					</Badge>
				</div>
			)}
		</div>
	);
}

// Side Dish Card Component
function SideDishCard({
	sideDish,
	onEdit,
	onDelete,
}: {
	sideDish: MenuSideDish;
	onEdit: (id: number) => void;
	onDelete: (id: number) => void;
}) {
	return (
		<div
			className={cn(
				'bg-card rounded-xl p-5 shadow-card border border-border/50 hover:shadow-card-hover transition-all duration-300',
				!sideDish.isAvailable && 'opacity-60',
			)}>
			<div className='flex items-start justify-between mb-3'>
				<div className='flex-1'>
					<h3 className='font-semibold text-foreground'>{sideDish.name}</h3>
					<p className='text-sm text-muted-foreground mt-1'>
						{sideDish.description}
					</p>
				</div>
				<span className='text-lg font-bold text-primary'>
					{sideDish.price.toLocaleString('en-US')}
				</span>
			</div>
			<div className='flex items-center justify-between'>
				<div className='flex-1'>
					{!sideDish.isAvailable && (
						<Badge
							variant='secondary'
							className='text-xs'>
							Unavailable
						</Badge>
					)}
				</div>
				<div className='flex items-center gap-1'>
					<Button
						variant='ghost'
						size='icon'
						className='h-8 w-8'
						onClick={() => onEdit(sideDish.id)}>
						<Edit className='h-4 w-4' />
					</Button>
					<Button
						variant='ghost'
						size='icon'
						className='h-8 w-8 text-destructive hover:text-destructive'
						onClick={() => onDelete(sideDish.id)}>
						<Trash2 className='h-4 w-4' />
					</Button>
				</div>
			</div>
		</div>
	);
}

// Addon Card Component
function AddonCard({
	addon,
	onEdit,
	onDelete,
}: {
	addon: MenuAddon;
	onEdit: (id: number) => void;
	onDelete: (id: number) => void;
}) {
	return (
		<div
			className={cn(
				'bg-card rounded-xl p-5 shadow-card border border-border/50 hover:shadow-card-hover transition-all duration-300',
				!addon.isAvailable && 'opacity-60',
			)}>
			<div className='flex items-start justify-between mb-3'>
				<div className='flex-1'>
					<h3 className='font-semibold text-foreground'>{addon.name}</h3>
					<p className='text-sm text-muted-foreground mt-1'>
						{addon.description}
					</p>
				</div>
				<span className='text-lg font-bold text-primary'>
					{addon.price.toLocaleString('en-US')}
				</span>
			</div>
			<div className='flex items-center justify-between'>
				<div className='flex-1'>
					{!addon.isAvailable && (
						<Badge
							variant='secondary'
							className='text-xs'>
							Unavailable
						</Badge>
					)}
				</div>
				<div className='flex items-center gap-1'>
					<Button
						variant='ghost'
						size='icon'
						className='h-8 w-8'
						onClick={() => onEdit(addon.id)}>
						<Edit className='h-4 w-4' />
					</Button>
					<Button
						variant='ghost'
						size='icon'
						className='h-8 w-8 text-destructive hover:text-destructive'
						onClick={() => onDelete(addon.id)}>
						<Trash2 className='h-4 w-4' />
					</Button>
				</div>
			</div>
		</div>
	);
}

export default function Menu() {
	const [isSideDialogOpen, setIsSideDialogOpen] = React.useState(false);
	const [isAddonDialogOpen, setIsAddonDialogOpen] = React.useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedCategory, setSelectedCategory] = useState('all');
	const [deleteItem, setDeleteItem] = useState<{
		id: number;
		type: 'menu' | 'addon' | 'side';
	} | null>(null);

	const navigate = useNavigate();
	const { toast } = useToast();
	const queryClient = useQueryClient();

	// Fetch menu items
	const {
		data: menuItemsData,
		isLoading: isLoadingMenuItems,
		error: menuItemsError,
	} = useQuery<MenuItem[], Error>({
		queryKey: ['menuItems'],
		queryFn: MenuService.getAllMenuItems,
	});

	// Fetch categories
	const { data: categoriesData, isLoading: isLoadingCategories } = useQuery<
		MenuCategory[],
		Error
	>({
		queryKey: ['menuCategories'],
		queryFn: MenuService.getAllMenuCategories,
	});

	// Fetch side dishes
	const { data: sideDishesData, isLoading: isLoadingSideDishes } = useQuery<
		MenuSideDish[],
		Error
	>({
		queryKey: ['menuSideDishes'],
		queryFn: MenuService.getAllMenuSideDishes,
	});

	// Fetch addons
	const { data: addonsData, isLoading: isLoadingAddons } = useQuery<
		MenuAddon[],
		Error
	>({
		queryKey: ['menuAddons'],
		queryFn: MenuService.getAllMenuAddons,
	});

	// Delete mutation
	const deleteMutation = useMutation({
		mutationFn: async ({
			id,
			type,
		}: {
			id: number;
			type: 'menu' | 'addon' | 'side';
		}) => {
			if (type === 'menu') {
				return MenuService.deleteMenuItem(id);
			} else if (type === 'addon') {
				return MenuService.deleteMenuAddon(id);
			} else {
				return MenuService.deleteMenuSideDish(id);
			}
		},
		onSuccess: () => {
			toast({
				title: 'Success',
				description: 'Item deleted successfully',
				variant: 'default',
			});
			// Invalidate and refetch
			queryClient.invalidateQueries({ queryKey: ['menuItems'] });
			queryClient.invalidateQueries({ queryKey: ['menuAddons'] });
			queryClient.invalidateQueries({ queryKey: ['menuSideDishes'] });
			setDeleteItem(null);
		},
		onError: (error: Error) => {
			toast({
				title: 'Error',
				description: error.message || 'Failed to delete item',
				variant: 'destructive',
			});
		},
	});

	const handleAddSideDish = (newSideDish: {
		name: string;
		description?: string;
		price: number;
		isAvailable: boolean;
	}) => {
		console.log('Adding new side dish:', newSideDish);
		setIsSideDialogOpen(false);
		queryClient.invalidateQueries({ queryKey: ['menuSideDishes'] });
	};

	const handleAddAddon = (newAddon: {
		name: string;
		description?: string;
		price: number;
		isAvailable: boolean;
	}) => {
		console.log('Adding new addon:', newAddon);
		setIsAddonDialogOpen(false);
		queryClient.invalidateQueries({ queryKey: ['menuAddons'] });
	};

	const handleEditMenuItem = (id: number) => {
		navigate(`/menu/${id}`);
	};

	const handleDeleteMenuItem = (id: number) => {
		setDeleteItem({ id, type: 'menu' });
	};

	const handleEditSideDish = (id: number) => {
		// Placeholder for side dish edit - can be expanded
		toast({
			description: 'Side dish edit not yet implemented',
		});
	};

	const handleDeleteSideDish = (id: number) => {
		setDeleteItem({ id, type: 'side' });
	};

	const handleEditAddon = (id: number) => {
		// Placeholder for addon edit - can be expanded
		toast({
			description: 'Addon edit not yet implemented',
		});
	};

	const handleDeleteAddon = (id: number) => {
		setDeleteItem({ id, type: 'addon' });
	};

	const confirmDelete = () => {
		if (deleteItem) {
			deleteMutation.mutate(deleteItem);
		}
	};

	// Create a map of categories by ID
	const categoryMap = useMemo(() => {
		if (!categoriesData) return {};
		return Object.fromEntries(categoriesData.map((cat) => [cat.id, cat.name]));
	}, [categoriesData]);

	// Group menu items by category
	const groupedMenuItems = useMemo(() => {
		if (!menuItemsData) return {};
		const grouped: Record<string, MenuItem[]> = {};
		menuItemsData.forEach((item) => {
			const categoryName = categoryMap[item.categoryId] || 'Other';
			if (!grouped[categoryName]) {
				grouped[categoryName] = [];
			}
			grouped[categoryName].push(item);
		});
		return grouped;
	}, [menuItemsData, categoryMap]);

	// Filter based on search and category
	const filteredMenuItems = useMemo(() => {
		if (!menuItemsData) return {};
		const filtered: Record<string, MenuItem[]> = {};

		Object.entries(groupedMenuItems).forEach(([category, items]) => {
			const categoryMatch =
				selectedCategory === 'all' ||
				category.toLowerCase() === selectedCategory.toLowerCase();
			const filteredItems = items.filter(
				(item) =>
					categoryMatch &&
					(item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
						item.description.toLowerCase().includes(searchQuery.toLowerCase())),
			);
			if (filteredItems.length > 0) {
				filtered[category] = filteredItems;
			}
		});

		return filtered;
	}, [groupedMenuItems, searchQuery, menuItemsData, selectedCategory]);

	const isLoading =
		isLoadingMenuItems ||
		isLoadingCategories ||
		isLoadingSideDishes ||
		isLoadingAddons;
	const menuItems = menuItemsData || [];
	const sideDishes = sideDishesData || [];
	const addons = addonsData || [];

	if (menuItemsError) {
		return (
			<MainLayout
				title='Menu'
				subtitle='Manage your restaurant menu items'>
				<div className='p-6 rounded-lg bg-red-50 border border-red-200 text-red-800'>
					<p className='font-medium'>❌ Error loading menu</p>
					<Button
						variant='outline'
						className='mt-4'
						onClick={() => window.location.reload()}>
						Retry
					</Button>
				</div>
			</MainLayout>
		);
	}

	return (
		<MainLayout
			title='Menu'
			subtitle='Manage your restaurant menu items'>
			<div className='space-y-6 animate-fade-in'>
				{/* Actions Bar */}
				<div className='flex flex-col sm:flex-row gap-4 justify-between'>
					<div className='relative flex-1 sm:w-80'>
						<Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
						<Input
							placeholder='Search menu items...'
							className='pl-9'
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</div>
					<Link to='/menu/new'>
						<Button className='gradient-primary text-primary-foreground shadow-glow hover:shadow-lg transition-shadow'>
							<Plus className='h-4 w-4 mr-2' />
							Add Item
						</Button>
					</Link>
				</div>

				{/* New Tabs Section - Menu Items, Sides, Addons */}
				<Tabs
					defaultValue='menu-items'
					className='w-full mt-6'>
					<TabsList className='bg-muted/50 p-1'>
						<TabsTrigger value='menu-items'>Menu Items</TabsTrigger>
						<TabsTrigger value='sides'>Sides</TabsTrigger>
						<TabsTrigger value='addons'>Addons</TabsTrigger>
					</TabsList>

					<TabsContent
						value='menu-items'
						className='mt-6'>
						<Tabs
							value={selectedCategory}
							onValueChange={setSelectedCategory}
							className='w-full'>
							<TabsList className='bg-muted/50 p-1 mb-6 flex flex-wrap justify-start'>
								<TabsTrigger value='all'>All Items</TabsTrigger>
								{Object.keys(groupedMenuItems).map((category) => (
									<TabsTrigger
										key={category}
										value={category.toLowerCase()}>
										{category}
									</TabsTrigger>
								))}
							</TabsList>

							{isLoading ? (
								<div className='flex justify-center items-center py-12'>
									<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary'></div>
									<span className='ml-4'>Loading menu items...</span>
								</div>
							) : Object.keys(filteredMenuItems).length === 0 ? (
								<div className='text-center py-12 text-muted-foreground'>
									<p>
										{searchQuery
											? 'No menu items match your search'
											: 'No menu items found'}
									</p>
								</div>
							) : (
								<div className='space-y-8'>
									{Object.entries(filteredMenuItems).map(
										([category, items]) => (
											<div key={category}>
												<h2 className='text-lg font-semibold text-foreground capitalize mb-4'>
													{category}
												</h2>
												<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
													{items.map((item) => (
														<MenuItemCard
															key={item.id}
															item={item}
															categoryName={category}
															onEdit={handleEditMenuItem}
															onDelete={handleDeleteMenuItem}
														/>
													))}
												</div>
											</div>
										),
									)}
								</div>
							)}
						</Tabs>
					</TabsContent>

					<TabsContent
						value='sides'
						className='mt-6'>
						<div className='flex justify-between items-center mb-4'>
							<h2 className='text-lg font-semibold text-foreground'>
								Side Dishes
							</h2>
							<Button
								onClick={() => setIsSideDialogOpen(true)}
								className='gradient-primary text-primary-foreground shadow-glow hover:shadow-lg transition-shadow'>
								<Plus className='h-4 w-4 mr-2' />
								Add Side Dish
							</Button>
						</div>
						{isLoading ? (
							<div className='flex justify-center items-center py-12'>
								<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary'></div>
								<span className='ml-4'>Loading side dishes...</span>
							</div>
						) : sideDishes.length === 0 ? (
							<div className='text-center py-12 text-muted-foreground'>
								<p>No side dishes found</p>
							</div>
						) : (
							<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
								{sideDishes.map((side) => (
									<SideDishCard
										key={side.id}
										sideDish={side}
										onEdit={handleEditSideDish}
										onDelete={handleDeleteSideDish}
									/>
								))}
							</div>
						)}
					</TabsContent>

					<TabsContent
						value='addons'
						className='mt-6'>
						<div className='flex justify-between items-center mb-4'>
							<h2 className='text-lg font-semibold text-foreground'>Addons</h2>
							<Button
								onClick={() => setIsAddonDialogOpen(true)}
								className='gradient-primary text-primary-foreground shadow-glow hover:shadow-lg transition-shadow'>
								<Plus className='h-4 w-4 mr-2' />
								Add Addon
							</Button>
						</div>
						{isLoading ? (
							<div className='flex justify-center items-center py-12'>
								<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary'></div>
								<span className='ml-4'>Loading addons...</span>
							</div>
						) : addons.length === 0 ? (
							<div className='text-center py-12 text-muted-foreground'>
								<p>No addons found</p>
							</div>
						) : (
							<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
								{addons.map((addon) => (
									<AddonCard
										key={addon.id}
										addon={addon}
										onEdit={handleEditAddon}
										onDelete={handleDeleteAddon}
									/>
								))}
							</div>
						)}
					</TabsContent>
				</Tabs>

				{/* Dialog Components */}
				<AddSideDishDialog
					isOpen={isSideDialogOpen}
					onClose={() => setIsSideDialogOpen(false)}
					onAddSideDish={handleAddSideDish}
				/>

				<AddAddonDialog
					isOpen={isAddonDialogOpen}
					onClose={() => setIsAddonDialogOpen(false)}
					onAddAddon={handleAddAddon}
				/>
			</div>

			{/* Delete Confirmation Dialog */}
			<AlertDialog
				open={!!deleteItem}
				onOpenChange={() => setDeleteItem(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							Are you sure you want to delete this item?
						</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={confirmDelete}
							className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
							disabled={deleteMutation.isPending}>
							{deleteMutation.isPending ? 'Deleting...' : 'Delete'}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</MainLayout>
	);
}
