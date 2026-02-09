import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
import { Plus, Search, AlertTriangle, Clock, Trash2, Package, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link, useNavigate } from 'react-router-dom';
import { BatchService, type ExpiringBatch } from '@/services/batchService';
import { toast } from 'sonner';

// Status styles configuration
const statusStyles = {
	critical: 'bg-red-500/10 text-red-500 border-red-500/20',
	warning: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
	normal: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
};

// Progress color based on days left
const getProgressColor = (daysLeft: number): string => {
	if (daysLeft <= 2) return 'bg-red-500';
	if (daysLeft <= 5) return 'bg-amber-500';
	return 'bg-emerald-500';
};

// Calculate status based on days left
const calculateStatus = (daysLeft: number): 'critical' | 'warning' | 'normal' => {
	if (daysLeft <= 2) return 'critical';
	if (daysLeft <= 5) return 'warning';
	return 'normal';
};

// Format date helper
const formatDate = (dateString: string): string => {
	const date = new Date(dateString);
	return date.toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	});
};

// Calculate days left from expiry date
const calculateDaysLeft = (expiryDate: string): number => {
	const today = new Date();
	const expiry = new Date(expiryDate);
	const diffTime = expiry.getTime() - today.getTime();
	return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const ExpiringProducts = () => {
	const [searchQuery, setSearchQuery] = useState('');
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [batchToDelete, setBatchToDelete] = useState<ExpiringBatch | null>(null);
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	// Query for expiring batches
	const {
		data: expiringBatches,
		isLoading: isLoadingExpiring,
		isError: isErrorExpiring,
	} = useQuery({
		queryKey: ['expiring-batches'],
		queryFn: BatchService.getExpiringBatches,
	});

	// Query for all batches (for calculations)
	const {
		data: allBatches,
		isLoading: isLoadingAll,
	} = useQuery({
		queryKey: ['all-batches'],
		queryFn: BatchService.getAllBatches,
	});

	const isLoading = isLoadingExpiring || isLoadingAll;

	// Calculate stats from expiring batches
	const criticalCount = expiringBatches?.filter(b => calculateStatus(calculateDaysLeft(b.expiryDate)) === 'critical').length || 0;
	const warningCount = expiringBatches?.filter(b => calculateStatus(calculateDaysLeft(b.expiryDate)) === 'warning').length || 0;

	// Filter batches based on search query
	const filteredBatches = expiringBatches?.filter((batch) => {
		const matchesSearch =
			batch.batchNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			batch.inventoryItem?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			batch.location?.toLowerCase().includes(searchQuery.toLowerCase());
		return matchesSearch;
	}) || [];

	// Handle delete button click
	const handleDeleteClick = (batch: ExpiringBatch) => {
		setBatchToDelete(batch);
		setDeleteDialogOpen(true);
	};

	// Handle delete confirmation (placeholder - no delete endpoint available)
	const handleDeleteConfirm = async () => {
		if (!batchToDelete) return;

		toast.info('Delete functionality', {
			description: `Delete for batch ${batchToDelete.batchNumber} - No delete endpoint available`,
		});

		setDeleteDialogOpen(false);
		setBatchToDelete(null);
	};

	// Loading state
	if (isLoading) {
		return (
			<MainLayout title='Expiring Products' subtitle='Manage inventory batches and expiration dates'>
				<div className='flex items-center justify-center h-64'>
					<div className='animate-spin rounded-full h-32 w-32 border-b-2 border-primary'></div>
				</div>
			</MainLayout>
		);
	}

	// Error state
	if (isErrorExpiring) {
		return (
			<MainLayout title='Expiring Products' subtitle='Manage inventory batches and expiration dates'>
				<div className='flex items-center justify-center h-64'>
					<div className='text-center'>
						<h2 className='text-2xl font-bold text-red-600 mb-4'>Error</h2>
						<p className='text-muted-foreground'>Failed to load expiring products data</p>
						<Button variant='outline' className='mt-4' onClick={() => queryClient.invalidateQueries({ queryKey: ['expiring-batches'] })}>
							Retry
						</Button>
					</div>
				</div>
			</MainLayout>
		);
	}

	return (
		<MainLayout title='Expiring Products' subtitle='Manage inventory batches and expiration dates'>
			<div className='space-y-6'>
				{/* Action Button */}
				<div className='flex justify-end'>
					<Button className='gradient-primary shadow-glow'>
						<Plus className='h-4 w-4 mr-2' />
						Add Batch
					</Button>
				</div>

				{/* Summary Cards */}
				<div className='grid gap-4 md:grid-cols-4'>
					<Card className='glass-card border-red-500/20'>
						<CardHeader className='pb-2'>
							<CardTitle className='text-sm font-medium text-muted-foreground flex items-center gap-2'>
								<AlertTriangle className='h-4 w-4 text-red-500' />
								Critical (≤2 days)
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold text-red-500'>{criticalCount}</div>
						</CardContent>
					</Card>
					<Card className='glass-card border-amber-500/20'>
						<CardHeader className='pb-2'>
							<CardTitle className='text-sm font-medium text-muted-foreground flex items-center gap-2'>
								<Clock className='h-4 w-4 text-amber-500' />
								Warning (3-5 days)
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold text-amber-500'>{warningCount}</div>
						</CardContent>
					</Card>
					<Card className='glass-card'>
						<CardHeader className='pb-2'>
							<CardTitle className='text-sm font-medium text-muted-foreground flex items-center gap-2'>
								<Package className='h-4 w-4' />
								Total Batches
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold text-foreground'>{allBatches?.length || 0}</div>
						</CardContent>
					</Card>
					<Card className='glass-card'>
						<CardHeader className='pb-2'>
							<CardTitle className='text-sm font-medium text-muted-foreground flex items-center gap-2'>
								<Trash2 className='h-4 w-4' />
								Expiring Soon
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold text-muted-foreground'>{filteredBatches.length}</div>
						</CardContent>
					</Card>
				</div>

				{/* Search */}
				<div className='flex items-center gap-4'>
					<div className='relative flex-1 max-w-md'>
						<Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
						<Input
							placeholder='Search batches by name, number, or location...'
							className='pl-9 glass-card'
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</div>
				</div>

				{/* Products Grid */}
				<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
					{filteredBatches.map((batch) => {
						const daysLeft = calculateDaysLeft(batch.expiryDate);
						const status = calculateStatus(daysLeft);

						return (
							<Card key={batch.id} className='glass-card hover:shadow-lg transition-shadow'>
								<CardHeader className='pb-3'>
									<div className='flex items-start justify-between'>
										<div>
											<CardTitle className='text-lg font-semibold text-foreground'>
												{batch.inventoryItem?.name || 'Unknown Item'}
											</CardTitle>
											<p className='text-sm text-muted-foreground'>{batch.batchNumber}</p>
										</div>
										<Badge className={statusStyles[status]}>
											{status === 'critical' && <AlertTriangle className='h-3 w-3 mr-1' />}
											{daysLeft} days left
										</Badge>
									</div>
								</CardHeader>
								<CardContent className='space-y-4'>
									<div className='space-y-2'>
										<div className='flex justify-between text-sm'>
											<span className='text-muted-foreground'>Time until expiry</span>
											<span className='text-foreground font-medium'>{daysLeft} days</span>
										</div>
										<Progress
											value={Math.max(0, Math.min(100, (14 - daysLeft) / 14 * 100))}
											className={cn('h-2', getProgressColor(daysLeft))}
										/>
									</div>

									<div className='grid grid-cols-2 gap-4 text-sm'>
										<div>
											<p className='text-muted-foreground'>Quantity</p>
											<p className='font-medium text-foreground'>
												{batch.quantity} {batch.inventoryItem?.unit || 'units'}
											</p>
										</div>
										<div>
											<p className='text-muted-foreground'>Location</p>
											<p className='font-medium text-foreground'>{batch.location || 'N/A'}</p>
										</div>
										<div>
											<p className='text-muted-foreground'>Received</p>
											<p className='font-medium text-foreground'>{formatDate(batch.receivedAt)}</p>
										</div>
										<div>
											<p className='text-muted-foreground'>Expires</p>
											<p className='font-medium text-foreground'>{formatDate(batch.expiryDate)}</p>
										</div>
									</div>

									<div className='flex gap-2 pt-2'>
										<Button
											size='sm'
											variant='outline'
											className='flex-1'
											onClick={() => navigate(`/inventory/expiring/use-stock/${batch.id}`)}
										>
											Use Stock
											<ArrowRight className='h-4 w-4 ml-1' />
										</Button>
										<Button
											size='sm'
											variant='ghost'
											className='text-red-500 hover:bg-red-500/10'
											onClick={() => handleDeleteClick(batch)}
										>
											<Trash2 className='h-4 w-4' />
										</Button>
									</div>
								</CardContent>
							</Card>
						);
					})}
				</div>

				{/* Empty state */}
				{filteredBatches.length === 0 && !isLoading && (
					<Card className='glass-card'>
						<CardContent className='flex flex-col items-center justify-center py-12'>
							<Package className='h-12 w-12 text-muted-foreground mb-4' />
							<h3 className='text-lg font-semibold text-foreground mb-2'>No Expiring Products</h3>
							<p className='text-muted-foreground text-center'>
								{searchQuery
									? 'No batches match your search criteria'
									: 'All products are within safe expiration periods'}
							</p>
						</CardContent>
					</Card>
				)}

				{/* Delete Confirmation Dialog */}
				<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
							<AlertDialogDescription>
								Are you sure you want to delete batch{' '}
								<span className='font-medium text-foreground'>
									{batchToDelete?.batchNumber}
								</span>
								? This action cannot be undone.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>Cancel</AlertDialogCancel>
							<AlertDialogAction
								onClick={handleDeleteConfirm}
								className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
							>
								Delete
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</div>
		</MainLayout>
	);
};

export default ExpiringProducts;
