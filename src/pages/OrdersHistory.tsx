import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import {
	Search,
	Filter,
	Download,
	Eye,
	Calendar,
	DollarSign,
	Receipt,
	Loader2,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { OrderService } from '@/services/orderService';
import { useToast } from '@/hooks/use-toast';
import type { EnhancedKitchenOrder } from '@/types/orderTypes';

export default function OrdersHistory() {
	const [searchQuery, setSearchQuery] = useState('');
	const [dateFilter, setDateFilter] = useState('all');
	const { toast } = useToast();

	// Calculate date ranges based on filter
	const dateRange = useMemo(() => {
		const now = new Date();
		const startOfToday = new Date(
			now.getFullYear(),
			now.getMonth(),
			now.getDate(),
		);

		switch (dateFilter) {
			case 'week': {
				const startOfWeek = new Date(startOfToday);
				startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay());
				return {
					startDate: startOfWeek.toISOString().split('T')[0],
					endDate: now.toISOString().split('T')[0],
				};
			}
			case 'month': {
				const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
				return {
					startDate: startOfMonth.toISOString().split('T')[0],
					endDate: now.toISOString().split('T')[0],
				};
			}
			default:
				return {};
		}
	}, [dateFilter]);

	// Fetch kitchen orders with details
	const {
		data: kitchenOrders = [],
		isLoading: ordersLoading,
		error: ordersError,
	} = useQuery({
		queryKey: ['kitchen-orders-with-details'],
		queryFn: () => OrderService.getKitchenOrdersWithDetails(),
		staleTime: 5 * 60 * 1000, // 5 minutes
	});

	// Fetch statistics - temporarily disabled until backend implements /order/stats endpoint
	// const { data: statsData, isLoading: statsLoading } = useQuery({
	// 	queryKey: ['orders-stats', dateRange],
	// 	queryFn: () => OrderService.getOrdersStats(dateRange),
	// 	staleTime: 5 * 60 * 1000,
	// });

	// Temporary placeholder stats until backend implements the endpoint
	const statsData = null;
	const statsLoading = false;

	const orders = useMemo(() => kitchenOrders || [], [kitchenOrders]);

	// Calculate basic stats from loaded orders as fallback
	const calculatedStats = useMemo(() => {
		if (orders.length === 0) {
			return [
				{
					title: 'Total Orders',
					value: '0',
					icon: Receipt,
					change: undefined,
				},
				{
					title: 'Total Revenue',
					value: '$0.00',
					icon: DollarSign,
					change: undefined,
				},
				{
					title: 'Avg Order Value',
					value: '$0.00',
					icon: Calendar,
					change: undefined,
				},
			];
		}

		const totalOrders = orders.length;
		const totalRevenue = orders.reduce(
			(sum, order) => sum + order.order.total,
			0,
		);
		const avgOrderValue = totalRevenue / totalOrders;

		return [
			{
				title: 'Total Orders',
				value: totalOrders.toLocaleString(),
				icon: Receipt,
				change: undefined, // Will show when backend implements period comparison
			},
			{
				title: 'Total Revenue',
				value: `$${totalRevenue.toLocaleString()}`,
				icon: DollarSign,
				change: undefined, // Will show when backend implements period comparison
			},
			{
				title: 'Avg Order Value',
				value: `$${avgOrderValue.toFixed(2)}`,
				icon: Calendar,
				change: undefined,
			},
		];
	}, [orders]);

	const stats = statsData
		? [
				{
					title: 'Total Orders',
					value: statsData.totalOrders.toLocaleString(),
					icon: Receipt,
					change: statsData.periodComparison
						? `${statsData.periodComparison.ordersChange > 0 ? '+' : ''}${statsData.periodComparison.ordersChange}%`
						: undefined,
				},
				{
					title: 'Total Revenue',
					value: `$${statsData.totalRevenue.toLocaleString()}`,
					icon: DollarSign,
					change: statsData.periodComparison
						? `${statsData.periodComparison.revenueChange > 0 ? '+' : ''}${statsData.periodComparison.revenueChange}%`
						: undefined,
				},
				{
					title: 'Avg Order Value',
					value: `$${statsData.averageOrderValue.toFixed(2)}`,
					icon: Calendar,
					change: undefined,
				},
			]
		: calculatedStats;

	const filteredOrders = useMemo(() => {
		if (!searchQuery) return orders;

		return orders.filter(
			(order) =>
				order.order.orderNumber
					.toString()
					.toLowerCase()
					.includes(searchQuery.toLowerCase()) ||
				(order.order.tableNumber &&
					`Table ${order.order.tableNumber}`
						.toLowerCase()
						.includes(searchQuery.toLowerCase())) ||
				(order.order.waiter &&
					order.order.waiter
						.toLowerCase()
						.includes(searchQuery.toLowerCase())) ||
				(order.order.customerName &&
					order.order.customerName
						.toLowerCase()
						.includes(searchQuery.toLowerCase())),
		);
	}, [orders, searchQuery]);

	const handleExport = async (format: 'csv' | 'excel' | 'pdf' = 'csv') => {
		try {
			const blob = await OrderService.exportOrders({
				...dateRange,
				status: 'COMPLETED',
				format,
			});

			const url = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `orders-history-${dateFilter}-${new Date().toISOString().split('T')[0]}.${format}`;
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);

			toast({
				title: 'Export successful',
				description: `Orders exported as ${format.toUpperCase()}`,
			});
		} catch (error) {
			toast({
				title: 'Export failed',
				description: 'Failed to export orders. Please try again.',
				variant: 'destructive',
			});
		}
	};

	return (
		<MainLayout
			title='Orders History'
			subtitle='View past completed orders'>
			{/* Stats */}
			<div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
				{statsLoading ? (
					<div className='col-span-3 flex justify-center py-8'>
						<Loader2 className='h-8 w-8 animate-spin' />
					</div>
				) : (
					stats.map((stat) => (
						<Card
							key={stat.title}
							className='card-hover'>
							<CardContent className='p-4'>
								<div className='flex items-center justify-between'>
									<div>
										<p className='text-sm text-muted-foreground'>
											{stat.title}
										</p>
										<p className='text-2xl font-bold mt-1'>{stat.value}</p>
										{stat.change && (
											<span className='text-xs text-emerald-500'>
												{stat.change} vs last period
											</span>
										)}
									</div>
									<div className='h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center'>
										<stat.icon className='h-6 w-6 text-primary' />
									</div>
								</div>
							</CardContent>
						</Card>
					))
				)}
			</div>

			{/* Filters */}
			<Card className='mb-6'>
				<CardContent className='p-4'>
					<div className='flex flex-col sm:flex-row gap-4'>
						<div className='relative flex-1'>
							<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
							<Input
								placeholder='Search by order ID, table, or waiter...'
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className='pl-10'
							/>
						</div>
						<div className='flex gap-2'>
							<Button
								variant={dateFilter === 'all' ? 'default' : 'outline'}
								size='sm'
								onClick={() => setDateFilter('all')}>
								All Time
							</Button>
							<Button
								variant={dateFilter === 'week' ? 'default' : 'outline'}
								size='sm'
								onClick={() => setDateFilter('week')}>
								This Week
							</Button>
							<Button
								variant={dateFilter === 'month' ? 'default' : 'outline'}
								size='sm'
								onClick={() => setDateFilter('month')}>
								This Month
							</Button>
							<Button
								variant='outline'
								size='sm'
								onClick={() => handleExport('csv')}>
								<Download className='h-4 w-4 mr-2' />
								Export
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Orders Table */}
			<Card>
				<CardHeader>
					<CardTitle className='text-lg'>Completed Orders</CardTitle>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Order ID</TableHead>
								<TableHead>Date & Time</TableHead>
								<TableHead>Table</TableHead>
								<TableHead>Items</TableHead>
								<TableHead>Waiter</TableHead>
								<TableHead>Payment</TableHead>
								<TableHead className='text-right'>Total</TableHead>
								<TableHead className='text-right'>Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{ordersLoading ? (
								<TableRow>
									<TableCell
										colSpan={8}
										className='text-center py-8'>
										<Loader2 className='h-6 w-6 animate-spin mx-auto' />
										<p className='text-sm text-muted-foreground mt-2'>
											Loading orders...
										</p>
									</TableCell>
								</TableRow>
							) : ordersError ? (
								<TableRow>
									<TableCell
										colSpan={8}
										className='text-center py-8 text-destructive'>
										<p>Failed to load orders. Please try again.</p>
									</TableCell>
								</TableRow>
							) : filteredOrders.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={8}
										className='text-center py-8 text-muted-foreground'>
										<p>No orders found for the selected period.</p>
									</TableCell>
								</TableRow>
							) : (
								filteredOrders.map((order) => (
									<TableRow key={order.id}>
										<TableCell className='font-medium'>
											#{order.order.orderNumber}
										</TableCell>
										<TableCell>
											<div>
												<span className='text-sm'>
													{new Date(order.createdAt).toLocaleDateString()}
												</span>
												<span className='text-xs text-muted-foreground ml-2'>
													{new Date(order.createdAt).toLocaleTimeString([], {
														hour: '2-digit',
														minute: '2-digit',
													})}
												</span>
											</div>
										</TableCell>
										<TableCell>
											{order.order.tableNumber
												? `Table ${order.order.tableNumber}`
												: 'Takeout'}
										</TableCell>
										<TableCell>{order.items?.length || 0} items</TableCell>
										<TableCell>{order.order.waiter || 'N/A'}</TableCell>
										<TableCell>
											<Badge
												variant={
													order.order.status === 'COMPLETED'
														? 'default'
														: 'secondary'
												}>
												{order.order.status}
											</Badge>
										</TableCell>
										<TableCell className='text-right font-medium'>
											${order.order.total.toFixed(2)}
										</TableCell>
										<TableCell className='text-right'>
											<Button
												variant='ghost'
												size='sm'>
												<Eye className='h-4 w-4' />
											</Button>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</MainLayout>
	);
}
