import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	Plus,
	Search,
	Package,
	AlertTriangle,
	TrendingDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import {
	Table,
	TableHeader,
	TableBody,
	TableHead,
	TableRow,
	TableCell,
} from '@/components/ui/table';
import { useState } from 'react';
import { InventoryService } from '@/services/inventoryService';
import type { InventoryItem } from '@/types/inventory.types';
import { useQuery } from '@tanstack/react-query';

const statusStyles = {
	normal: 'bg-success/10 text-success border-success/20',
	low: 'bg-warning/10 text-warning border-warning/20',
	critical: 'bg-destructive/10 text-destructive border-destructive/20',
};

const statusIcons = {
	normal: Package,
	low: TrendingDown,
	critical: AlertTriangle,
};

export default function Inventory() {
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedCategory, setSelectedCategory] = useState('all');

	// Query for all inventory items
	const {
		data: inventoryItems,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ['inventory-items'],
		queryFn: () => InventoryService.getAllInventoryItems(),
	});

	// Calculate low stock items
	const lowStockItems =
		inventoryItems?.filter((item) => {
			// Assuming items with stock < 10 are low, < 5 are critical
			const currentStock = item.quantity ?? item.stock;
			if (!currentStock) return false;
			return currentStock < 10;
		}).length || 0;

	// Calculate unique categories
	const categories = inventoryItems
		? Array.from(
				new Set(
					inventoryItems.map((item) => item.category?.name || 'Uncategorized'),
				),
			)
		: [];

	// Filter items
	const filteredItems =
		inventoryItems?.filter((item) => {
			const matchesSearch = item.name
				.toLowerCase()
				.includes(searchQuery.toLowerCase());
			const matchesCategory =
				selectedCategory === 'all' || item.category?.name === selectedCategory;
			return matchesSearch && matchesCategory;
		}) || [];

	if (isLoading) {
		return (
			<MainLayout
				title='Inventory'
				subtitle='Track and manage your stock levels'>
				<div className='flex items-center justify-center h-64'>
					<div className='animate-spin rounded-full h-32 w-32 border-b-2 border-primary'></div>
				</div>
			</MainLayout>
		);
	}

	if (isError) {
		return (
			<MainLayout
				title='Inventory'
				subtitle='Track and manage your stock levels'>
				<div className='flex items-center justify-center h-64'>
					<div className='text-center'>
						<h2 className='text-2xl font-bold text-red-600 mb-4'>Error</h2>
						<p className='text-muted-foreground'>
							Failed to load inventory data
						</p>
						<Button
							variant='outline'
							className='mt-4'
							onClick={() => window.location.reload()}>
							Retry
						</Button>
					</div>
				</div>
			</MainLayout>
		);
	}

	return (
		<MainLayout
			title='Inventory'
			subtitle='Track and manage your stock levels'>
			<div className='space-y-6 animate-fade-in'>
				{/* Stats */}
				<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
					<div className='bg-card rounded-xl p-5 shadow-card border border-border/50'>
						<div className='flex items-center gap-3'>
							<div className='p-3 rounded-xl bg-primary/10'>
								<Package className='h-5 w-5 text-primary' />
							</div>
							<div>
								<p className='text-sm text-muted-foreground'>Total Items</p>
								<p className='text-2xl font-bold text-foreground'>
									{inventoryItems?.length || 0}
								</p>
							</div>
						</div>
					</div>
					<div className='bg-card rounded-xl p-5 shadow-card border border-border/50'>
						<div className='flex items-center gap-3'>
							<div className='p-3 rounded-xl bg-warning/10'>
								<AlertTriangle className='h-5 w-5 text-warning' />
							</div>
							<div>
								<p className='text-sm text-muted-foreground'>
									Low Stock Alerts
								</p>
								<p className='text-2xl font-bold text-foreground'>
									{lowStockItems}
								</p>
							</div>
						</div>
					</div>
					<div className='bg-card rounded-xl p-5 shadow-card border border-border/50'>
						<div className='flex items-center gap-3'>
							<div className='p-3 rounded-xl bg-success/10'>
								<TrendingDown className='h-5 w-5 text-success' />
							</div>
							<div>
								<p className='text-sm text-muted-foreground'>Categories</p>
								<p className='text-2xl font-bold text-foreground'>
									{categories.length}
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Actions Bar */}
				<div className='flex flex-col sm:flex-row gap-4 justify-between'>
					<div className='flex gap-3'>
						<div className='relative flex-1 sm:w-80'>
							<Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
							<Input
								placeholder='Search inventory...'
								className='pl-9'
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
							/>
						</div>
						<Select
							value={selectedCategory}
							onValueChange={setSelectedCategory}>
							<SelectTrigger className='w-40'>
								<SelectValue placeholder='Category' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='all'>All Categories</SelectItem>
								{categories.map((category) => (
									<SelectItem
										key={category}
										value={category}>
										{category}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<Link to='/inventory/new'>
						<Button className='gradient-primary text-primary-foreground shadow-glow hover:shadow-lg transition-shadow'>
							<Plus className='h-4 w-4 mr-2' />
							Add Item
						</Button>
					</Link>
				</div>

				{/* Inventory Table */}
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Item</TableHead>
							<TableHead>Category</TableHead>
							<TableHead>Current Stock</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Unit Price</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredItems.map((item) => {
							// Determine status based on stock level
							let status: keyof typeof statusStyles = 'normal';
							const currentStock = item.quantity ?? item.stock;
							if (currentStock !== undefined) {
								if (currentStock < 5) {
									status = 'critical';
								} else if (currentStock < 10) {
									status = 'low';
								}
							}

							const StatusIcon = statusIcons[status];

							return (
								<TableRow key={item.id}>
									<TableCell>
										<div className='font-medium text-foreground'>
											{item.name}
										</div>
									</TableCell>
									<TableCell>
										<div className='text-sm text-muted-foreground'>
											{item.category?.name || 'Uncategorized'}
										</div>
									</TableCell>
									<TableCell>
										<div className='font-medium text-foreground'>
											{(currentStock ?? 0)} {item.unit}
										</div>
									</TableCell>
									<TableCell>
										<Badge className={cn('capitalize', statusStyles[status])}>
											<StatusIcon className='h-3 w-3 mr-1' />
											{status}
										</Badge>
									</TableCell>

									<TableCell>
										<div className='font-semibold text-primary'>
											{item.price.toLocaleString()} TZS/{item.unit}
										</div>
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</div>
		</MainLayout>
	);
}
