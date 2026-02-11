import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { StatCard } from '@/components/dashboard/StatCard';
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
	Edit,
	Truck,
	Package,
	FileText,
	Loader2,
	Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate, Link } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { PurchaseOrderService } from '@/services/purchaseOrderService';
import type {
	PurchaseOrder,
	PurchaseOrderStats,
} from '@/types/purchaseOrder.types';
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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Status styles mapping - supports both lowercase
const statusStyles: Record<string, string> = {
	pending: 'bg-warning/10 text-warning border-warning/20',
	'in-transit': 'bg-primary/10 text-primary border-primary/20',
	delivered: 'bg-success/10 text-success border-success/20',
	cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
	approved: 'bg-success/10 text-success border-success/20',
	ordered: 'bg-primary/10 text-primary border-primary/20',
	partially_received: 'bg-warning/10 text-warning border-warning/20',
	completed: 'bg-success/10 text-success border-success/20',
};

// Status icons mapping
const statusIcons: Record<
	string,
	React.ComponentType<{ className?: string }>
> = {
	pending: FileText,
	'in-transit': Truck,
	delivered: Package,
	cancelled: FileText,
	approved: FileText,
	ordered: FileText,
	partially_received: Package,
	completed: Package,
};

// API error handler
const handleApiError = (error: unknown, defaultMessage: string): string => {
	if (!error) return defaultMessage;
	const err = error as Record<string, unknown>;
	const response = err?.response as Record<string, unknown>;
	if (!response) return defaultMessage;
	const data = response?.data as Record<string, unknown>;
	if (!data) return defaultMessage;
	return String(data?.message || data?.error || defaultMessage);
};

// Safe date formatter
const formatDate = (dateString: string | undefined | null): string => {
	if (!dateString) return 'N/A';
	try {
		const date = new Date(dateString);
		if (isNaN(date.getTime())) {
			return 'Invalid Date';
		}
		return date.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
		});
	} catch {
		return 'Invalid Date';
	}
};

// Format currency safely
const formatCurrency = (value: number | undefined | null): string => {
	if (value === undefined || value === null || isNaN(value)) {
		return '0.00';
	}
	return value.toLocaleString('en-US', {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	});
};

// Get status display name
const getStatusDisplayName = (status: string | undefined): string => {
	if (!status) return 'Unknown';
	return status
		.replace(/_/g, ' ')
		.replace(/-/g, ' ')
		.toLowerCase()
		.replace(/\b\w/g, (c) => c.toUpperCase());
};

// Normalize status to lowercase for consistent comparisons
const normalizeStatus = (status: string | undefined): string => {
	if (!status) return '';
	return status.toLowerCase();
};

// Helper to calculate total from items if purchase.total is not provided
const calculateTotal = (purchase: PurchaseOrder): number => {
	// If total is provided and valid, use it
	if (
		purchase.total !== undefined &&
		purchase.total !== null &&
		purchase.total > 0
	) {
		return purchase.total;
	}

	// Otherwise, calculate from items
	if (purchase.items && purchase.items.length > 0) {
		return purchase.items.reduce((sum, item) => {
			const price = item.unitPrice || item.price || 0;
			const quantity = item.quantityOrdered || item.quantity || 0;
			return sum + price * quantity;
		}, 0);
	}

	return 0;
};

export default function Purchases() {
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState('all');
	const queryClient = useQueryClient();
	const { toast } = useToast();
	const navigate = useNavigate();

	// Query for fetching purchase orders
	const {
		data: purchases = [],
		isLoading: purchasesLoading,
		isError: purchasesError,
		error: purchasesErrorMsg,
	} = useQuery({
		queryKey: ['purchaseOrders'],
		queryFn: async () => {
			const response = await PurchaseOrderService.getAllPurchaseOrders();
			return response;
		},
		retry: false,
	});

	// Calculate stats from purchase orders data
	const stats: PurchaseOrderStats = useMemo(() => {
		const currentMonth = new Date().getMonth();
		const currentYear = new Date().getFullYear();

		// Handle both response formats: nested supplier object or flat supplier_name
		const thisMonthPurchases = purchases.filter((purchase) => {
			// Get order date from either orderedAt or date field
			const orderDate =
				((purchase as unknown as Record<string, unknown>)
					.orderedAt as string) || purchase.date;
			if (!orderDate) return false;
			const purchaseDate = new Date(orderDate);
			if (isNaN(purchaseDate.getTime())) return false;
			return (
				purchaseDate.getMonth() === currentMonth &&
				purchaseDate.getFullYear() === currentYear
			);
		});

		return {
			totalOrders: purchases.length,
			pending: purchases.filter((p) => normalizeStatus(p.status) === 'pending')
				.length,
			inTransit: 0, // Backend doesn't support IN_TRANSIT status
			delivered: purchases.filter(
				(p) => normalizeStatus(p.status) === 'delivered',
			).length,
			cancelled: purchases.filter(
				(p) => normalizeStatus(p.status) === 'cancelled',
			).length,
			totalSpent: purchases.reduce((total, p) => total + calculateTotal(p), 0),
		};
	}, [purchases]);

	// Mutation for deleting purchase order
	const deleteMutation = useMutation({
		mutationFn: (id: string) => PurchaseOrderService.deletePurchaseOrder(id),
		onSuccess: () => {
			toast({
				title: 'Success',
				description: 'Purchase order deleted successfully',
			});
			// Invalidate queries to refetch data
			queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] });
		},
		onError: (error: unknown) => {
			toast({
				title: 'Error',
				description: handleApiError(error, 'Failed to delete purchase order'),
				variant: 'destructive',
			});
		},
	});

	// Helper to get supplier name from either nested object or flat field
	const getSupplierName = (purchase: PurchaseOrder): string => {
		// Check if supplier is a nested object
		if (purchase.supplier && typeof purchase.supplier === 'object') {
			const supplier = purchase.supplier as unknown as Record<string, unknown>;
			return (supplier.name as string) || 'Unknown';
		}
		// Fall back to flat field
		return purchase.supplier_name || 'Unknown';
	};

	// Helper to get order ID - use poNumber if available, otherwise use id
	const getOrderId = (purchase: PurchaseOrder): string => {
		const poNumber = (purchase as unknown as Record<string, unknown>)
			.poNumber as string;
		if (poNumber) return poNumber;
		return purchase.id || 'N/A';
	};

	// Helper to get order date from either orderedAt or date
	const getOrderDate = (purchase: PurchaseOrder): string => {
		const orderedAt = (purchase as unknown as Record<string, unknown>)
			.orderedAt as string;
		if (orderedAt) return formatDate(orderedAt);
		return formatDate(purchase.date);
	};

	// Filter purchases based on search and status
	const filteredPurchases = purchases.filter((purchase) => {
		const supplierName = getSupplierName(purchase);
		const orderId = getOrderId(purchase);
		const matchesSearch =
			supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
			orderId.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesStatus =
			statusFilter === 'all' ||
			normalizeStatus(purchase.status) === normalizeStatus(statusFilter);
		return matchesSearch && matchesStatus;
	});

	// Loading state
	const isLoading = purchasesLoading;

	// Error handling
	if (purchasesError) {
		return (
			<MainLayout
				title='Purchases'
				subtitle='Manage supplier orders and deliveries'>
				<div className='flex flex-col items-center justify-center py-12 text-center'>
					<div className='bg-destructive/10 text-destructive p-4 rounded-full mb-4'>
						<Trash2 className='h-8 w-8' />
					</div>
					<h2 className='text-xl font-semibold text-foreground mb-2'>
						Error Loading Purchase Orders
					</h2>
					<p className='text-muted-foreground mb-4'>
						{handleApiError(
							purchasesErrorMsg,
							'An unexpected error occurred. Please try again.',
						)}
					</p>
					<Button
						onClick={() =>
							queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] })
						}
						variant='outline'>
						Try Again
					</Button>
				</div>
			</MainLayout>
		);
	}

	return (
		<MainLayout
			title='Purchases'
			subtitle='Manage supplier orders and deliveries'>
			<div className='space-y-6 animate-fade-in'>
				{/* Stats */}
				<div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
					<StatCard
						title='Total Orders'
						value={stats.totalOrders}
						subtitle='All time'
						loading={purchasesLoading}
						textColor='foreground'
					/>
					<StatCard
						title='Pending'
						value={stats.pending}
						subtitle='Awaiting approval'
						loading={purchasesLoading}
						textColor='warning'
					/>
					<StatCard
						title='In Transit'
						value={stats.inTransit}
						subtitle='On the way'
						loading={purchasesLoading}
						textColor='primary'
					/>
					<StatCard
						title='Total Spent'
						value={formatCurrency(stats.totalSpent)}
						subtitle='This month'
						loading={purchasesLoading}
						textColor='foreground'
					/>
				</div>

				{/* Actions Bar */}
				<div className='flex flex-col sm:flex-row gap-4 justify-between'>
					<div className='flex gap-3'>
						<div className='relative flex-1 sm:w-80'>
							<Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
							<Input
								placeholder='Search purchases...'
								className='pl-9'
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
						</div>
						<Select
							value={statusFilter}
							onValueChange={setStatusFilter}>
							<SelectTrigger className='w-40'>
								<SelectValue placeholder='Status' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='all'>All Status</SelectItem>
								<SelectItem value='PENDING'>Pending</SelectItem>
								<SelectItem value='CANCELLED'>Cancelled</SelectItem>
								<SelectItem value='APPROVED'>Approved</SelectItem>
								<SelectItem value='ORDERED'>Ordered</SelectItem>
								<SelectItem value='PARTIALLY_RECEIVED'>
									Partially Received
								</SelectItem>
								<SelectItem value='COMPLETED'>Completed</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<Button
						onClick={() => navigate('/purchases/new')}
						className='gradient-primary text-primary-foreground shadow-glow hover:shadow-lg transition-shadow'>
						<Plus className='h-4 w-4 mr-2' />
						New Purchase Order
					</Button>
				</div>

				{/* Purchases Table */}
				<div className='bg-card rounded-xl shadow-card border border-border/50 overflow-hidden'>
					<div className='overflow-x-auto'>
						<table className='w-full'>
							<thead className='bg-muted/50'>
								<tr>
									<th className='text-left px-6 py-4 text-sm font-medium text-muted-foreground'>
										Order ID
									</th>
									<th className='text-left px-6 py-4 text-sm font-medium text-muted-foreground'>
										Supplier
									</th>
									<th className='text-left px-6 py-4 text-sm font-medium text-muted-foreground'>
										Items
									</th>
									<th className='text-left px-6 py-4 text-sm font-medium text-muted-foreground'>
										Order Date
									</th>
									<th className='text-left px-6 py-4 text-sm font-medium text-muted-foreground'>
										Status
									</th>
									<th className='text-left px-6 py-4 text-sm font-medium text-muted-foreground'>
										Total
									</th>
									<th className='text-right px-6 py-4 text-sm font-medium text-muted-foreground'>
										Actions
									</th>
								</tr>
							</thead>
							<tbody className='divide-y divide-border'>
								{isLoading ? (
									<tr>
										<td
											colSpan={7}
											className='px-6 py-12 text-center text-muted-foreground'>
											<Loader2 className='h-8 w-8 animate-spin mx-auto mb-4' />
											Loading purchase orders...
										</td>
									</tr>
								) : filteredPurchases.length === 0 ? (
									<tr>
										<td
											colSpan={7}
											className='px-6 py-12 text-center text-muted-foreground'>
											No purchase orders found
										</td>
									</tr>
								) : (
									filteredPurchases.map((purchase) => {
										const normalizedStatus = normalizeStatus(purchase.status);
										const statusKey =
											normalizedStatus in statusStyles
												? normalizedStatus
												: 'pending';
										const StatusIcon = statusIcons[statusKey] || FileText;
										return (
											<tr
												key={purchase.id}
												className='hover:bg-muted/30 transition-colors'>
												<td className='px-6 py-4 font-medium text-foreground'>
													{getOrderId(purchase)}
												</td>
												<td className='px-6 py-4 text-foreground'>
													{getSupplierName(purchase)}
												</td>
												<td className='px-6 py-4 text-foreground'>
													{purchase.items?.length || 0} items
												</td>
												<td className='px-6 py-4 text-muted-foreground'>
													{getOrderDate(purchase)}
												</td>
												<td className='px-6 py-4'>
													<Badge
														className={cn(
															'capitalize',
															statusStyles[statusKey] ||
																statusStyles['pending'],
														)}>
														<StatusIcon className='h-3 w-3 mr-1' />
														{getStatusDisplayName(purchase.status)}
													</Badge>
												</td>
												<td className='px-6 py-4 font-semibold text-foreground'>
													{formatCurrency(calculateTotal(purchase))}
												</td>
												<td className='px-6 py-4'>
													<div className='flex items-center justify-end gap-2'>
														<Link to={`/purchases/edit/${purchase.id}`}>
															<Button
																variant='ghost'
																size='icon'
																className='h-8 w-8'>
																<Edit className='h-4 w-4' />
															</Button>
														</Link>
														<AlertDialog>
															<AlertDialogTrigger asChild>
																<Button
																	variant='ghost'
																	size='icon'
																	className='h-8 w-8 text-destructive hover:text-destructive'
																	disabled={deleteMutation.isPending}>
																	{deleteMutation.isPending ? (
																		<Loader2 className='h-4 w-4 animate-spin' />
																	) : (
																		<Trash2 className='h-4 w-4' />
																	)}
																</Button>
															</AlertDialogTrigger>
															<AlertDialogContent>
																<AlertDialogHeader>
																	<AlertDialogTitle>
																		Delete Purchase Order
																	</AlertDialogTitle>
																	<AlertDialogDescription>
																		Are you sure you want to delete purchase
																		order {getOrderId(purchase)}? This action
																		cannot be undone.
																	</AlertDialogDescription>
																</AlertDialogHeader>
																<AlertDialogFooter>
																	<AlertDialogCancel>Cancel</AlertDialogCancel>
																	<AlertDialogAction
																		onClick={() =>
																			deleteMutation.mutate(purchase.id!)
																		}
																		className='bg-destructive text-destructive-foreground hover:bg-destructive/90'>
																		Delete
																	</AlertDialogAction>
																</AlertDialogFooter>
															</AlertDialogContent>
														</AlertDialog>
													</div>
												</td>
											</tr>
										);
									})
								)}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</MainLayout>
	);
}
