import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	Plus,
	Search,
	Edit,
	MoreHorizontal,
	Phone,
	Mail,
	Star,
	Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useMemo, useEffect } from 'react';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SupplierService } from '@/services/supplierService';
import { Supplier, CreateSupplierDto } from '@/types/supplier.types';
import { useToast } from '@/hooks/use-toast';

// status styles removed (backend doesn't use supplier status)

// Supplier Card Component
function SupplierCard({
	supplier,
	onEdit,
	onDelete,
}: {
	supplier: Supplier;
	onEdit: (id: number) => void;
	onDelete: (id: number) => void;
}) {
	return (
		<div className='bg-card rounded-xl p-5 shadow-card border border-border/50 hover:shadow-lg transition-all'>
			<div className='flex items-start justify-between mb-4'>
				<div>
					<h3 className='font-semibold text-foreground'>{supplier.name}</h3>
					<p className='text-sm text-muted-foreground'>
						{supplier.contactPerson}
					</p>
				</div>
			</div>

			<div className='space-y-3 mb-4'>
				<div className='flex items-center gap-2 text-muted-foreground'>
					<Phone className='h-4 w-4' />
					<span>{supplier.phone}</span>
				</div>
				<div className='flex items-center gap-2 text-muted-foreground'>
					<Mail className='h-4 w-4' />
					<span className='truncate'>{supplier.email}</span>
				</div>
				<div className='flex items-center gap-2 text-muted-foreground'>
					<span className='text-xs'>{supplier.address}</span>
				</div>
			</div>

			<div className='flex items-center gap-2 pt-3 border-t border-border'>
				<Button
					variant='outline'
					size='sm'
					className='flex-1'
					onClick={() => onEdit(supplier.id)}>
					<Edit className='h-4 w-4 mr-1' />
					Edit
				</Button>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant='ghost'
							size='icon'
							className='h-8 w-8'>
							<MoreHorizontal className='h-4 w-4' />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align='end'>
						<DropdownMenuItem
							className='text-destructive focus:text-destructive'
							onClick={() => onDelete(supplier.id)}>
							Delete
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>
	);
}

export default function Suppliers() {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedCategory, setSelectedCategory] = useState('all');
	const [displayCount, setDisplayCount] = useState(9);
	const [deleteItem, setDeleteItem] = useState<number | null>(null);
	const { toast } = useToast();
	const queryClient = useQueryClient();

	const [newSupplier, setNewSupplier] = useState<CreateSupplierDto>({
		name: '',
		contactPerson: '',
		phone: '',
		email: '',
		address: '',
	});

	// Fetch suppliers
	const {
		data: suppliersData,
		isLoading,
		error,
	} = useQuery<Supplier[], Error>({
		queryKey: ['suppliers'],
		queryFn: SupplierService.getAllSuppliers,
	});

	const suppliers = useMemo(() => suppliersData || [], [suppliersData]);

	// Get unique inventory categories from all suppliers
	const categories = useMemo(() => {
		const cats = new Set<string>();
		suppliers.forEach((s) => {
			s.inventoryCategories?.forEach((cat) => {
				cats.add(cat.name);
			});
		});
		return Array.from(cats).sort();
	}, [suppliers]);

	// Filter suppliers
	const filteredSuppliers = useMemo(() => {
		return suppliers.filter((supplier) => {
			const matchesSearch =
				supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				supplier.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
				supplier.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
				supplier.address.toLowerCase().includes(searchQuery.toLowerCase());

			// Filter by category if selected (by inventory categories)
			const matchesCategory =
				selectedCategory === 'all' ||
				supplier.inventoryCategories?.some(
					(cat) => cat.name.toLowerCase() === selectedCategory.toLowerCase(),
				);

			return matchesSearch && matchesCategory;
		});
	}, [suppliers, searchQuery, selectedCategory]);

	// Calculate stats
	const stats = useMemo(() => {
		return SupplierService.calculateStats(suppliers);
	}, [suppliers]);

	// Pagination
	const displayedSuppliers = filteredSuppliers.slice(0, displayCount);
	const hasMore = filteredSuppliers.length > displayCount;

	// Create supplier mutation
	const createMutation = useMutation({
		mutationFn: (data: CreateSupplierDto) =>
			SupplierService.createSupplier(data),
		onSuccess: () => {
			toast({
				title: 'Success',
				description: 'Supplier created successfully',
				variant: 'default',
			});
			queryClient.invalidateQueries({ queryKey: ['suppliers'] });
			setIsModalOpen(false);
			setNewSupplier({
				name: '',
				contactPerson: '',
				phone: '',
				email: '',
				address: '',
			});
		},
		onError: (error: Error) => {
			toast({
				title: 'Error',
				description: error.message || 'Failed to create supplier',
				variant: 'destructive',
			});
		},
	});

	// Delete supplier mutation
	const deleteMutation = useMutation({
		mutationFn: (id: number) => SupplierService.deleteSupplier(id),
		onSuccess: () => {
			toast({
				title: 'Success',
				description: 'Supplier deleted successfully',
				variant: 'default',
			});
			queryClient.invalidateQueries({ queryKey: ['suppliers'] });
			setDeleteItem(null);
		},
		onError: (error: Error) => {
			toast({
				title: 'Error',
				description: error.message || 'Failed to delete supplier',
				variant: 'destructive',
			});
		},
	});

	const handleInputChange = (field: string, value: string) => {
		setNewSupplier((prev) => ({ ...prev, [field]: value }));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (
			!newSupplier.name ||
			!newSupplier.address ||
			!newSupplier.contactPerson ||
			!newSupplier.phone ||
			!newSupplier.email
		) {
			toast({
				title: 'Error',
				description: 'Please fill in all required fields',
				variant: 'destructive',
			});
			return;
		}
		createMutation.mutate(newSupplier);
	};

	const handleEdit = (id: number) => {
		// TODO: Implement edit navigation
		toast({
			description: 'Edit supplier feature coming soon',
		});
	};

	const handleDelete = (id: number) => {
		setDeleteItem(id);
	};

	const confirmDelete = () => {
		if (deleteItem) {
			deleteMutation.mutate(deleteItem);
		}
	};

	if (error) {
		return (
			<MainLayout
				title='Suppliers'
				subtitle='Manage your supplier relationships'>
				<div className='p-6 rounded-lg bg-red-50 border border-red-200 text-red-800'>
					<p className='font-medium'>❌ Error loading suppliers</p>
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
			title='Suppliers'
			subtitle='Manage your supplier relationships'>
			<div className='space-y-6 animate-fade-in'>
				{/* Stats */}
				<div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
					<div className='bg-card rounded-xl p-5 shadow-card border border-border/50'>
						<p className='text-sm text-muted-foreground'>Total Suppliers</p>
						<p className='text-2xl font-bold text-foreground mt-1'>
							{stats.totalSuppliers}
						</p>
						<p className='text-xs text-muted-foreground mt-1'>
							Across all categories
						</p>
					</div>
					<div className='bg-card rounded-xl p-5 shadow-card border border-border/50'>
						<p className='text-sm text-muted-foreground'>Active</p>
						<p className='text-2xl font-bold text-success mt-1'>
							{stats.activeSuppliers}
						</p>
						<p className='text-xs text-muted-foreground mt-1'>
							Currently trading
						</p>
					</div>
					<div className='bg-card rounded-xl p-5 shadow-card border border-border/50'>
						<p className='text-sm text-muted-foreground'>Top Rated</p>
						<p className='text-2xl font-bold text-warning mt-1'>
							{stats.topRated}
						</p>
						<p className='text-xs text-muted-foreground mt-1'>
							5-star suppliers
						</p>
					</div>
					<div className='bg-card rounded-xl p-5 shadow-card border border-border/50'>
						<p className='text-sm text-muted-foreground'>Categories</p>
						<p className='text-2xl font-bold text-foreground mt-1'>
							{stats.categories}
						</p>
						<p className='text-xs text-muted-foreground mt-1'>
							Product categories
						</p>
					</div>
				</div>

				{/* Actions Bar */}
				<div className='flex flex-col sm:flex-row gap-4 justify-between'>
					<div className='flex gap-3 flex-1'>
						<div className='relative flex-1 sm:w-80'>
							<Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
							<Input
								placeholder='Search suppliers...'
								className='pl-9'
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
							/>
						</div>
					</div>
					<Dialog
						open={isModalOpen}
						onOpenChange={setIsModalOpen}>
						<DialogTrigger asChild>
							<Button className='gradient-primary text-primary-foreground shadow-glow hover:shadow-lg transition-shadow'>
								<Plus className='h-4 w-4 mr-2' />
								Add Supplier
							</Button>
						</DialogTrigger>
						<DialogContent className='sm:max-w-[600px]'>
							<DialogHeader>
								<DialogTitle className='text-xl font-bold'>
									Add New Supplier
								</DialogTitle>
							</DialogHeader>
							<form
								onSubmit={handleSubmit}
								className='space-y-4 py-4'>
								<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
									<div className='space-y-2'>
										<Label
											htmlFor='name'
											className='text-sm font-medium'>
											Supplier Name *
										</Label>
										<Input
											id='name'
											value={newSupplier.name}
											onChange={(e) =>
												handleInputChange('name', e.target.value)
											}
											placeholder='Enter supplier name'
											required
											className='h-9'
										/>
									</div>
									<div className='space-y-2'>
										<Label
											htmlFor='address'
											className='text-sm font-medium'>
											Address *
										</Label>
										<Input
											id='address'
											value={newSupplier.address}
											onChange={(e) =>
												handleInputChange('address', e.target.value)
											}
											placeholder='Enter address'
											required
											className='h-9'
										/>
									</div>
								</div>

								<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
									<div className='space-y-2'>
										<Label
											htmlFor='contact'
											className='text-sm font-medium'>
											Contact Person *
										</Label>
										<Input
											id='contact'
											value={newSupplier.contactPerson}
											onChange={(e) =>
												handleInputChange('contactPerson', e.target.value)
											}
											placeholder='Enter contact name'
											required
											className='h-9'
										/>
									</div>
									<div className='space-y-2'>
										<Label
											htmlFor='phone'
											className='text-sm font-medium'>
											Phone *
										</Label>
										<Input
											id='phone'
											value={newSupplier.phone}
											onChange={(e) =>
												handleInputChange('phone', e.target.value)
											}
											placeholder='Enter phone number'
											required
											className='h-9'
										/>
									</div>
								</div>

								<div className='space-y-2'>
									<Label
										htmlFor='email'
										className='text-sm font-medium'>
										Email *
									</Label>
									<Input
										id='email'
										type='email'
										value={newSupplier.email}
										onChange={(e) => handleInputChange('email', e.target.value)}
										placeholder='Enter email address'
										required
										className='h-9'
									/>
								</div>

								<div className='flex justify-end gap-3 pt-4'>
									<Button
										type='button'
										variant='outline'
										onClick={() => setIsModalOpen(false)}>
										Cancel
									</Button>
									<Button
										type='submit'
										disabled={createMutation.isPending}
										className='gradient-primary text-primary-foreground shadow-glow hover:shadow-lg transition-shadow'>
										{createMutation.isPending ? (
											<>
												<Loader2 className='h-4 w-4 mr-2 animate-spin' />
												Creating...
											</>
										) : (
											'Create Supplier'
										)}
									</Button>
								</div>
							</form>
						</DialogContent>
					</Dialog>
				</div>

				{/* Inventory Categories Tabs */}
				{categories.length > 0 && (
					<Tabs
						value={selectedCategory}
						onValueChange={setSelectedCategory}
						className='w-full'>
						<TabsList className='bg-muted/50 p-1 flex flex-wrap justify-start'>
							<TabsTrigger value='all'>All Inventory Categories</TabsTrigger>
							{categories.map((category) => (
								<TabsTrigger
									key={category}
									value={category.toLowerCase()}>
									{category}
								</TabsTrigger>
							))}
						</TabsList>
					</Tabs>
				)}

				{/* Loading State */}
				{isLoading ? (
					<div className='flex justify-center items-center py-12'>
						<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary'></div>
						<span className='ml-4'>Loading suppliers...</span>
					</div>
				) : filteredSuppliers.length === 0 ? (
					<div className='text-center py-12 text-muted-foreground'>
						<p>
							{searchQuery
								? 'No suppliers match your search'
								: 'No suppliers found'}
						</p>
					</div>
				) : (
					<>
						{/* Suppliers Grid */}
						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
							{displayedSuppliers.map((supplier) => (
								<SupplierCard
									key={supplier.id}
									supplier={supplier}
									onEdit={handleEdit}
									onDelete={handleDelete}
								/>
							))}
						</div>

						{/* Show More Button */}
						{hasMore && (
							<div className='flex justify-center pt-6'>
								<Button
									variant='outline'
									onClick={() => setDisplayCount((prev) => prev + 9)}>
									Show More
								</Button>
							</div>
						)}
					</>
				)}
			</div>

			{/* Delete Confirmation Dialog */}
			<AlertDialog
				open={deleteItem !== null}
				onOpenChange={() => setDeleteItem(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							Are you sure you want to delete this supplier?
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
