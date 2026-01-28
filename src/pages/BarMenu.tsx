import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
	Plus,
	Search,
	Edit,
	Trash2,
	Star,
	ToggleLeft,
	ToggleRight,
	Utensils,
	GlassWater,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MenuService } from '@/services/menuService';
import { MenuItem, MenuCategory } from '@/types/menuType';
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
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

// Use the MenuItem type from the service with bar-specific category
interface BarMenuItem extends Omit<MenuItem, 'categoryId' | 'menuCategory'> {
	category: string; // Use string to support any category name
	orders?: number; // Optional field for display purposes
	categoryName?: string; // Store the actual category name
}

function BarMenuCard({
	item,
	onToggleAvailability,
	onEdit,
	onDelete,
}: {
	item: BarMenuItem;
	onToggleAvailability: (id: number) => void;
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
					{item.categoryName && (
						<Badge
							variant='outline'
							className='mt-2 text-xs'>
							{item.categoryName}
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
					{item.orders && <span>{item.orders} orders</span>}
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
					<Button
						variant='ghost'
						size='icon'
						className='h-8 w-8'
						onClick={() => onToggleAvailability(item.id)}>
						{item.isAvailable ? (
							<ToggleRight className='h-4 w-4 text-success' />
						) : (
							<ToggleLeft className='h-4 w-4 text-muted-foreground' />
						)}
					</Button>
				</div>
			</div>
		</div>
	);
}

export default function BarMenu() {
	const [searchQuery, setSearchQuery] = useState('');
	const [searchParams, setSearchParams] = useSearchParams();
	const [activeTab, setActiveTab] = useState('all');
	const { toast } = useToast();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [deleteItem, setDeleteItem] = useState<{
		id: number;
	} | null>(null);

	// Fetch all required data using React Query
	const {
		data: menuItemsData,
		isLoading: isLoadingMenuItems,
		error: menuItemsError,
	} = useQuery<MenuItem[], Error>({
		queryKey: ['menuItems'],
		queryFn: MenuService.getAllMenuItems,
	});

	const {
		data: categoriesData,
		isLoading: isLoadingCategories,
		error: categoriesError,
	} = useQuery<MenuCategory[], Error>({
		queryKey: ['menuCategories'],
		queryFn: MenuService.getAllMenuCategories,
	});

	// Check if any data is still loading
	const isLoading = isLoadingMenuItems || isLoadingCategories;

	// Check if any error occurred
	const error = menuItemsError || categoriesError;

	// Process menu items with category mapping
	const menuItems: BarMenuItem[] = useMemo(() => {
		if (!menuItemsData || !categoriesData) return [];

		return menuItemsData
			.filter((item) => item.prepArea === 'BAR')
			.map((item) => {
				const category = categoriesData.find(
					(cat) => cat.id === item.categoryId,
				);
				const categoryName = category ? category.name : 'Uncategorized';
				return {
					...item,
					category: categoryName,
					categoryName: categoryName,
				};
			});
	}, [menuItemsData, categoriesData]);

	// Use data directly from React Query
	const categories = categoriesData || [];

	// Show error toast when any error occurs
	useEffect(() => {
		if (error) {
			console.error('Error fetching menu data:', error);
			toast({
				title: 'Error',
				description: 'Failed to load bar menu data',
				variant: 'destructive',
			});
		}
	}, [error, toast]);

	const toggleAvailability = (id: number) => {
		// Find the current item to get its current availability
		const currentItem = menuItems.find((item) => item.id === id);

		if (currentItem) {
			const newAvailability = !currentItem.isAvailable;
			toggleMutation.mutate({ id, isAvailable: newAvailability });
		}
	};

	const handleEdit = (id: number) => {
		navigate(`/bar/menu/${id}`);
	};

	const deleteMutation = useMutation({
		mutationFn: async ({ id }: { id: number }) => {
			return MenuService.deleteMenuItem(id);
		},
		onSuccess: () => {
			toast({
				title: 'Success',
				description: 'Item deleted successfully',
				variant: 'default',
			});
			// Invalidate and refetch menu data
			queryClient.invalidateQueries({ queryKey: ['menuItems'] });
			setDeleteItem(null);
		},
		onError: (error) => {
			toast({
				title: 'Error',
				description: 'Failed to delete item',
				variant: 'destructive',
			});
		},
	});

	const toggleMutation = useMutation({
		mutationFn: async ({
			id,
			isAvailable,
		}: {
			id: number;
			isAvailable: boolean;
		}) => {
			return MenuService.updateMenuItem(id, { isAvailable });
		},
		onSuccess: () => {
			// Invalidate and refetch menu data
			queryClient.invalidateQueries({ queryKey: ['menuItems'] });
		},
		onError: (error) => {
			toast({
				title: 'Error',
				description: 'Failed to update availability',
				variant: 'destructive',
			});
		},
	});

	const handleDelete = (id: number) => {
		setDeleteItem({ id });
	};

	const confirmDelete = () => {
		if (deleteItem) {
			deleteMutation.mutate(deleteItem);
		}
	};

	// Filter menu items based on search
	const filteredMenuItems = menuItems.filter((item) => {
		const matchesSearch =
			item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			item.description.toLowerCase().includes(searchQuery.toLowerCase());
		return matchesSearch;
	});

	// Group items by category
	const groupedItems = filteredMenuItems.reduce(
		(acc, item) => {
			const categoryKey = item.categoryName || 'Uncategorized';
			if (!acc[categoryKey]) {
				acc[categoryKey] = [];
			}
			acc[categoryKey].push(item);
			return acc;
		},
		{} as Record<string, BarMenuItem[]>,
	);

	return (
		<MainLayout
			title='Bar Management'
			subtitle='Manage bar menu items'>
			<div className='space-y-6 animate-fade-in'>
				{/* Loading and Error States */}
				{isLoading ? (
					<div className='flex justify-center items-center py-12'>
						<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary'></div>
						<span className='ml-4 text-lg'>Loading bar management...</span>
					</div>
				) : error ? (
					<div className='p-6 rounded-lg bg-red-50 border border-red-200 text-red-800'>
						<p className='font-medium'>❌ Error loading menu</p>
						<p className='mt-2'>{error?.message || 'An error occurred'}</p>
						<Button
							variant='outline'
							className='mt-4'
							onClick={() => window.location.reload()}>
							Retry
						</Button>
					</div>
				) : (
					<>
						{/* Actions Bar */}
						<div className='flex flex-col sm:flex-row gap-4 justify-between'>
							<div className='relative flex-1 sm:w-80'>
								<Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
								<Input
									placeholder='Search bar menu items...'
									className='pl-9'
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
								/>
							</div>
							<Link to='/menu/new?type=bar'>
								<Button className='gradient-primary text-primary-foreground shadow-glow hover:shadow-lg transition-shadow'>
									<Plus className='h-4 w-4 mr-2' />
									Add Bar Item
								</Button>
							</Link>
						</div>

						{/* Menu Tabs */}
						<Tabs
							defaultValue='all'
							value={activeTab}
							onValueChange={setActiveTab}
							className='w-full'>
							<TabsList className='bg-muted/50 p-1'>
								<TabsTrigger value='all'>All Items</TabsTrigger>
								{Object.keys(groupedItems).map((category) => (
									<TabsTrigger
										key={category}
										value={category}>
										{category}
									</TabsTrigger>
								))}
							</TabsList>

							<TabsContent
								value='all'
								className='mt-6'>
								<div className='space-y-8'>
									{Object.entries(groupedItems).map(([category, items]) => (
										<div key={category}>
											<h2 className='text-lg font-semibold text-foreground capitalize mb-4'>
												{category.replace('-', ' ')}
											</h2>
											<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
												{items.map((item) => (
													<BarMenuCard
														key={item.id}
														item={item}
														onToggleAvailability={toggleAvailability}
														onEdit={handleEdit}
														onDelete={handleDelete}
													/>
												))}
											</div>
										</div>
									))}
								</div>
							</TabsContent>

							{Object.entries(groupedItems).map(([category, items]) => (
								<TabsContent
									key={category}
									value={category}
									className='mt-6'>
									<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
										{items.map((item) => (
											<BarMenuCard
												key={item.id}
												item={item}
												onToggleAvailability={toggleAvailability}
												onEdit={handleEdit}
												onDelete={handleDelete}
											/>
										))}
									</div>
								</TabsContent>
							))}
						</Tabs>
					</>
				)}
			</div>

			{/* Delete Confirmation Dialog */}
			<AlertDialog
				open={!!deleteItem}
				onOpenChange={() => setDeleteItem(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							Are you sure you want to delete this menu item?
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
