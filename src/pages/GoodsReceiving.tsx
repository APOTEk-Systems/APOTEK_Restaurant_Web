import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
	Plus,
	Search,
	Eye,
	Edit,
	Trash2,
	Loader2,
	CheckCircle2,
	Clock,
	AlertCircle,
	Package,
	ArrowLeft,
	X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { GoodsReceivingService } from '@/services/goodsReceivingService';
import type {
	GoodsReceiving,
	GoodsReceivingStats,
	GoodsReceivingItem,
} from '@/types/goodsReceiving.types';
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

// Status styles mapping
const statusStyles: Record<string, string> = {
	pending: 'bg-warning/10 text-warning border-warning/20',
	partial: 'bg-primary/10 text-primary border-primary/20',
	complete: 'bg-success/10 text-success border-success/20',
	issue: 'bg-destructive/10 text-destructive border-destructive/20',
};

// Status icons mapping
const statusIcons: Record<
	string,
	React.ComponentType<{ className?: string }>
> = {
	pending: Clock,
	partial: Package,
	complete: CheckCircle2,
	issue: AlertCircle,
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
	if (!dateString || dateString === '-' || !dateString) return 'N/A';
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

// Safe datetime formatter
const formatDateTime = (dateString: string | undefined | null): string => {
	if (!dateString || dateString === '-' || !dateString) return 'N/A';
	try {
		const date = new Date(dateString);
		if (isNaN(date.getTime())) {
			return 'Invalid Date';
		}
		return date.toLocaleString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	} catch {
		return 'Invalid Date';
	}
};

// Get status display name
const getStatusDisplayName = (status: string | undefined): string => {
	if (!status) return 'Unknown';
	// First normalize the status
	const normalized = normalizeStatus(status);
	// Map normalized status to display name
	const displayNames: Record<string, string> = {
		complete: 'Completed',
		pending: 'Pending',
		partial: 'Partially Received',
		issue: 'Has Issues',
	};
	return displayNames[normalized] || status;
};

// Normalize status to lowercase for consistent comparisons
// Maps various API status formats to our internal status types
const normalizeStatus = (status: string | undefined): string => {
	if (!status) return '';
	const normalized = status.toLowerCase().replace(/_/g, '');
	// Map common API status values to our internal status types
	if (['completed', 'complete'].includes(normalized)) return 'complete';
	if (['pending', 'pendingapproval', 'pendingreview'].includes(normalized))
		return 'pending';
	if (
		['partial', 'partiallyreceived', 'partially_received'].includes(normalized)
	)
		return 'partial';
	if (
		['issue', 'issues', 'hasissues', 'has_issues', 'problem'].includes(
			normalized,
		)
	)
		return 'issue';
	return normalized;
};

// Helper to get supplier name from nested supplier object
const getSupplierName = (receiving: GoodsReceiving): string => {
	if (receiving.supplier && typeof receiving.supplier === 'object') {
		return (receiving.supplier as { name?: string }).name || 'Unknown';
	}
	return 'Unknown';
};

// Helper to get PO number
const getPONumber = (receiving: GoodsReceiving): string => {
	if (receiving.purchaseOrder && typeof receiving.purchaseOrder === 'object') {
		return (
			(receiving.purchaseOrder as { poNumber?: string }).poNumber ||
			String(receiving.purchaseOrderId)
		);
	}
	return String(receiving.purchaseOrderId);
};

// Helper to get PO status - checks multiple sources and infers from data
const getPOStatus = (receiving: GoodsReceiving): string => {
	// First try to get status from nested purchaseOrder object
	if (receiving.purchaseOrder && typeof receiving.purchaseOrder === 'object') {
		const status = (receiving.purchaseOrder as { status?: string }).status;
		if (status) return status;
	}
	// Fallback: check if receiving has its own status field
	if (receiving.status) {
		return receiving.status;
	}
	// If we have receivedAt date and items, this is likely complete
	// Otherwise mark as pending until we can determine actual status
	if (
		receiving.receivedAt &&
		(receiving.totalItems ||
			receiving.total_items ||
			receiving.receivedItems?.length)
	) {
		return 'complete'; // Has date and items, assume complete
	}
	if (receiving.receivedAt) {
		return 'pending'; // Has date but no items, might be partial
	}
	// No status can be determined
	return '';
};

// Calculate items count with fallback for different API field names
const getItemsCount = (receiving: GoodsReceiving): number => {
	return (
		receiving.totalItems ||
		receiving.total_items ||
		receiving.receivedItems?.length ||
		0
	);
};

// Calculate total quantity received
const calculateTotalReceived = (items?: GoodsReceivingItem[]): number => {
	if (!items || !Array.isArray(items)) return 0;
	return items.reduce((sum, item) => sum + (item.quantityReceived || 0), 0);
};

// View Dialog Component
interface ViewDialogProps {
	receiving: GoodsReceiving;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

function ViewDialog({ receiving, open, onOpenChange }: ViewDialogProps) {
	const totalReceived = calculateTotalReceived(receiving.receivedItems);
	const itemCount = getItemsCount(receiving);

	return (
		<Card className='w-full max-w-2xl mx-auto animate-fade-in'>
			<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
				<CardTitle className='text-lg'>Goods Receiving Details</CardTitle>
				<Button
					variant='ghost'
					size='icon'
					className='h-8 w-8'
					onClick={() => onOpenChange(false)}>
					<X className='h-4 w-4' />
				</Button>
			</CardHeader>
			<CardContent className='space-y-6'>
				{/* Header Info */}
				<div className='grid grid-cols-2 gap-4'>
					<div className='space-y-1'>
						<p className='text-sm text-muted-foreground'>GRN Number</p>
						<p className='text-lg font-semibold'>
							{receiving.grnNumber || `GRN-${receiving.id}`}
						</p>
					</div>
					<div className='space-y-1'>
						<p className='text-sm text-muted-foreground'>Status</p>
						<Badge
							className={cn(
								'capitalize',
								statusStyles[normalizeStatus(getPOStatus(receiving))] ||
									statusStyles['complete'],
							)}>
							{getStatusDisplayName(getPOStatus(receiving))}
						</Badge>
					</div>
				</div>

				{/* PO and Supplier Info */}
				<div className='grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg'>
					<div className='space-y-1'>
						<p className='text-sm text-muted-foreground'>Purchase Order</p>
						<p className='font-medium'>{getPONumber(receiving)}</p>
					</div>
					<div className='space-y-1'>
						<p className='text-sm text-muted-foreground'>Supplier</p>
						<p className='font-medium'>{getSupplierName(receiving)}</p>
					</div>
				</div>

				{/* Dates */}
				<div className='grid grid-cols-2 gap-4'>
					<div className='space-y-1'>
						<p className='text-sm text-muted-foreground'>Received Date</p>
						<p className='font-medium'>{formatDate(receiving.receivedAt)}</p>
					</div>
					<div className='space-y-1'>
						<p className='text-sm text-muted-foreground'>Items Received</p>
						<p className='font-medium'>{itemCount} items</p>
					</div>
				</div>

				{/* Notes */}
				{receiving.notes && (
					<div className='space-y-1'>
						<p className='text-sm text-muted-foreground'>Notes</p>
						<p className='p-3 bg-muted/30 rounded-lg'>{receiving.notes}</p>
					</div>
				)}

				{/* Received Items */}
				{receiving.receivedItems && receiving.receivedItems.length > 0 && (
					<div className='space-y-2'>
						<p className='text-sm font-medium'>Received Items</p>
						<div className='border rounded-lg overflow-hidden'>
							<table className='w-full'>
								<thead className='bg-muted/50'>
									<tr>
										<th className='text-left px-4 py-2 text-sm font-medium'>
											Item
										</th>
										<th className='text-center px-4 py-2 text-sm font-medium'>
											Qty Received
										</th>
										<th className='text-left px-4 py-2 text-sm font-medium'>
											Batch
										</th>
									</tr>
								</thead>
								<tbody className='divide-y'>
									{receiving.receivedItems.map((item) => (
										<tr key={item.id}>
											<td className='px-4 py-2'>
												{item.inventoryItem?.name ||
													`Item #${item.inventoryItemId}`}
											</td>
											<td className='px-4 py-2 text-center font-medium'>
												{item.quantityReceived}
											</td>
											<td className='px-4 py-2 text-muted-foreground'>
												{item.batch?.batchNumber || '-'}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
						<div className='text-right font-semibold'>
							Total: {totalReceived} units
						</div>
					</div>
				)}

				{/* Timestamps */}
				<div className='grid grid-cols-2 gap-4 text-xs text-muted-foreground pt-4 border-t'>
					<div>Created: {formatDateTime(receiving.createdAt)}</div>
					<div className='text-right'>
						Updated: {formatDateTime(receiving.updatedAt)}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

export default function GoodsReceiving() {
	const { id } = useParams();
	const isViewMode = !!id;
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState('all');
	const [viewRecord, setViewRecord] = useState<GoodsReceiving | null>(null);
	const queryClient = useQueryClient();
	const { toast } = useToast();
	const navigate = useNavigate();

	// Query for fetching single record (view mode)
	const { data: singleRecord, isLoading: singleLoading } = useQuery({
		queryKey: ['goodsReceiving', id],
		queryFn: async () => {
			if (!id) return null;
			const response = await GoodsReceivingService.getGoodsReceivingById(id);
			return response;
		},
		enabled: !!id,
		retry: false,
	});

	// Show view dialog when single record is loaded
	useMemo(() => {
		if (singleRecord && isViewMode) {
			setViewRecord(singleRecord);
		}
	}, [singleRecord, isViewMode]);

	// Query for fetching goods receiving records (list mode)
	const {
		data: receivings = [],
		isLoading: receivingsLoading,
		isError: receivingsError,
		error: receivingsErrorMsg,
	} = useQuery({
		queryKey: ['goodsReceivingList'],
		queryFn: async () => {
			const response = await GoodsReceivingService.getAllGoodsReceiving();
			return response;
		},
		enabled: !isViewMode, // Only load list when not in view mode
		retry: false,
	});

	// Calculate stats from data
	const stats: GoodsReceivingStats = useMemo(() => {
		const data = isViewMode && singleRecord ? [singleRecord] : receivings;
		return {
			totalReceived: data.filter(
				(r) => normalizeStatus(getPOStatus(r)) === 'complete',
			).length,
			pending: data.filter((r) => normalizeStatus(getPOStatus(r)) === 'pending')
				.length,
			partial: data.filter((r) => normalizeStatus(getPOStatus(r)) === 'partial')
				.length,
			issues: data.filter((r) => normalizeStatus(getPOStatus(r)) === 'issue')
				.length,
		};
	}, [receivings, singleRecord, isViewMode]);

	// Mutation for deleting goods receiving
	const deleteMutation = useMutation({
		mutationFn: (id: number) =>
			GoodsReceivingService.deleteGoodsReceiving(String(id)),
		onSuccess: () => {
			toast({
				title: 'Success',
				description: 'Goods receiving record deleted successfully',
			});
			queryClient.invalidateQueries({ queryKey: ['goodsReceivingList'] });
		},
		onError: (error: unknown) => {
			toast({
				title: 'Error',
				description: handleApiError(
					error,
					'Failed to delete goods receiving record',
				),
				variant: 'destructive',
			});
		},
	});

	// Filter receivings based on search and status
	const filteredReceivings = useMemo(() => {
		if (isViewMode && singleRecord) return [singleRecord];
		return receivings.filter((receiving) => {
			const supplierName = getSupplierName(receiving);
			const poNumber = getPONumber(receiving);
			const grnNumber = receiving.grnNumber || '';
			const matchesSearch =
				supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
				poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
				grnNumber.toLowerCase().includes(searchTerm.toLowerCase());
			const receivingStatus = getPOStatus(receiving);
			const matchesStatus =
				statusFilter === 'all' ||
				normalizeStatus(receivingStatus) === normalizeStatus(statusFilter);
			return matchesSearch && matchesStatus;
		});
	}, [receivings, singleRecord, searchTerm, statusFilter, isViewMode]);

	const isLoading = isViewMode ? singleLoading : receivingsLoading;

	// Error handling
	if (receivingsError && !isViewMode) {
		return (
			<MainLayout
				title='Goods Receiving'
				subtitle='Track and manage incoming deliveries'>
				<div className='flex flex-col items-center justify-center py-12 text-center'>
					<div className='bg-destructive/10 text-destructive p-4 rounded-full mb-4'>
						<AlertCircle className='h-8 w-8' />
					</div>
					<h2 className='text-xl font-semibold text-foreground mb-2'>
						Error Loading Goods Receiving Records
					</h2>
					<p className='text-muted-foreground mb-4'>
						{handleApiError(
							receivingsErrorMsg,
							'An unexpected error occurred. Please try again.',
						)}
					</p>
					<Button
						onClick={() =>
							queryClient.invalidateQueries({
								queryKey: ['goodsReceivingList'],
							})
						}
						variant='outline'>
						Try Again
					</Button>
				</div>
			</MainLayout>
		);
	}

	// View mode - show details dialog
	if (isViewMode) {
		return (
			<MainLayout
				title='Goods Receiving Details'
				subtitle='View receiving record'>
				<div className='space-y-6 animate-fade-in'>
					<Link to='/purchases/receiving'>
						<Button
							variant='ghost'
							className='gap-2'>
							<ArrowLeft className='h-4 w-4' />
							Back to Goods Receiving
						</Button>
					</Link>

					{isLoading ? (
						<div className='flex items-center justify-center py-12'>
							<Loader2 className='h-8 w-8 animate-spin text-primary' />
						</div>
					) : viewRecord ? (
						<ViewDialog
							receiving={viewRecord}
							open={!!viewRecord}
							onOpenChange={(open) => {
								if (!open) navigate('/purchases/receiving');
							}}
						/>
					) : (
						<div className='text-center py-12 text-muted-foreground'>
							Record not found
						</div>
					)}
				</div>
			</MainLayout>
		);
	}

	// List mode
	return (
		<MainLayout
			title='Goods Receiving'
			subtitle='Track and manage incoming deliveries'>
			<div className='space-y-6 animate-fade-in'>
				{/* Stats */}
				<div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
					<div className='bg-card rounded-xl p-5 shadow-card border border-border/50'>
						<p className='text-sm text-muted-foreground'>Total Received</p>
						<p className='text-2xl font-bold text-foreground mt-1'>
							{stats.totalReceived}
						</p>
						<p className='text-xs text-success mt-1'>Completed</p>
					</div>
					<div className='bg-card rounded-xl p-5 shadow-card border border-border/50'>
						<p className='text-sm text-muted-foreground'>Pending</p>
						<p className='text-2xl font-bold text-warning mt-1'>
							{stats.pending}
						</p>
						<p className='text-xs text-muted-foreground mt-1'>
							Awaiting delivery
						</p>
					</div>
					<div className='bg-card rounded-xl p-5 shadow-card border border-border/50'>
						<p className='text-sm text-muted-foreground'>Partial Deliveries</p>
						<p className='text-2xl font-bold text-primary mt-1'>
							{stats.partial}
						</p>
						<p className='text-xs text-muted-foreground mt-1'>
							Incomplete orders
						</p>
					</div>
					<div className='bg-card rounded-xl p-5 shadow-card border border-border/50'>
						<p className='text-sm text-muted-foreground'>Issues</p>
						<p className='text-2xl font-bold text-destructive mt-1'>
							{stats.issues}
						</p>
						<p className='text-xs text-muted-foreground mt-1'>
							Requires attention
						</p>
					</div>
				</div>

				{/* Actions Bar */}
				<div className='flex flex-col sm:flex-row gap-4 justify-between'>
					<div className='flex gap-3'>
						<div className='relative flex-1 sm:w-80'>
							<Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
							<Input
								placeholder='Search by PO, supplier or GRN...'
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
								<SelectItem value='PARTIAL'>Partial</SelectItem>
								<SelectItem value='COMPLETED'>Completed</SelectItem>
								<SelectItem value='CANCELLED'>Cancelled</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<Button
						onClick={() => navigate('/purchases/receiving/new')}
						className='gradient-primary text-primary-foreground shadow-glow hover:shadow-lg transition-shadow'>
						<Plus className='h-4 w-4 mr-2' />
						Record Receiving
					</Button>
				</div>

				{/* Receiving Table */}
				<div className='bg-card rounded-xl shadow-card border border-border/50 overflow-hidden'>
					<div className='overflow-x-auto'>
						<table className='w-full'>
							<thead className='bg-muted/50'>
								<tr>
									<th className='text-left px-6 py-4 text-sm font-medium text-muted-foreground'>
										GRN Number
									</th>
									<th className='text-left px-6 py-4 text-sm font-medium text-muted-foreground'>
										PO Reference
									</th>
									<th className='text-left px-6 py-4 text-sm font-medium text-muted-foreground'>
										Supplier
									</th>
									<th className='text-left px-6 py-4 text-sm font-medium text-muted-foreground'>
										Items
									</th>
									<th className='text-left px-6 py-4 text-sm font-medium text-muted-foreground'>
										Received Date
									</th>
									<th className='text-left px-6 py-4 text-sm font-medium text-muted-foreground'>
										Status
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
											Loading goods receiving records...
										</td>
									</tr>
								) : filteredReceivings.length === 0 ? (
									<tr>
										<td
											colSpan={7}
											className='px-6 py-12 text-center text-muted-foreground'>
											No goods receiving records found
										</td>
									</tr>
								) : (
									filteredReceivings.map((receiving) => {
										const receivingStatus = getPOStatus(receiving);
										const normalizedStatus = normalizeStatus(receivingStatus);
										const statusKey =
											normalizedStatus in statusStyles
												? normalizedStatus
												: 'complete';
										const StatusIcon = statusIcons[statusKey] || CheckCircle2;
										const itemCount = getItemsCount(receiving);

										return (
											<tr
												key={receiving.id}
												className='hover:bg-muted/30 transition-colors'>
												<td className='px-6 py-4 font-medium text-foreground'>
													{receiving.grnNumber || `GRN-${receiving.id}`}
												</td>
												<td className='px-6 py-4 text-primary font-medium'>
													{getPONumber(receiving)}
												</td>
												<td className='px-6 py-4 text-foreground'>
													{getSupplierName(receiving)}
												</td>
												<td className='px-6 py-4 text-foreground'>
													{itemCount} items
												</td>
												<td className='px-6 py-4 text-muted-foreground'>
													{formatDate(receiving.receivedAt)}
												</td>
												<td className='px-6 py-4'>
													<Badge
														className={cn(
															'capitalize',
															statusStyles[statusKey] ||
																statusStyles['complete'],
														)}>
														<StatusIcon className='h-3 w-3 mr-1' />
														{getStatusDisplayName(receivingStatus)}
													</Badge>
												</td>
												<td className='px-6 py-4'>
													<div className='flex items-center justify-end gap-2'>
														<DropdownMenu>
															<DropdownMenuTrigger asChild>
																<Button
																	variant='ghost'
																	size='icon'
																	className='h-8 w-8'>
																	<Package className='h-4 w-4' />
																</Button>
															</DropdownMenuTrigger>
															<DropdownMenuContent
																align='end'
																className='w-48'>
																<DropdownMenuItem
																	onClick={() =>
																		navigate(
																			`/purchases/receiving/${receiving.id}`,
																		)
																	}>
																	<Eye className='h-4 w-4 mr-2' />
																	View Details
																</DropdownMenuItem>
																<DropdownMenuItem
																	onClick={() =>
																		navigate(
																			`/purchases/receiving/edit/${receiving.id}`,
																		)
																	}>
																	<Edit className='h-4 w-4 mr-2' />
																	Edit
																</DropdownMenuItem>
																<DropdownMenuSeparator />
																<AlertDialog>
																	<AlertDialogTrigger asChild>
																		<DropdownMenuItem
																			onSelect={(e) => e.preventDefault()}
																			className='text-destructive focus:text-destructive'>
																			<Trash2 className='h-4 w-4 mr-2' />
																			Delete
																		</DropdownMenuItem>
																	</AlertDialogTrigger>
																	<AlertDialogContent>
																		<AlertDialogHeader>
																			<AlertDialogTitle>
																				Delete Goods Receiving Record
																			</AlertDialogTitle>
																			<AlertDialogDescription>
																				Are you sure you want to delete this
																				goods receiving record? This action
																				cannot be undone.
																			</AlertDialogDescription>
																		</AlertDialogHeader>
																		<AlertDialogFooter>
																			<AlertDialogCancel>
																				Cancel
																			</AlertDialogCancel>
																			<AlertDialogAction
																				onClick={() =>
																					deleteMutation.mutate(receiving.id)
																				}
																				className='bg-destructive text-destructive-foreground hover:bg-destructive/90'>
																				Delete
																			</AlertDialogAction>
																		</AlertDialogFooter>
																	</AlertDialogContent>
																</AlertDialog>
															</DropdownMenuContent>
														</DropdownMenu>
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
