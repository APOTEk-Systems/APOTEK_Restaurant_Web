import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
	ArrowLeft,
	Package,
	Calendar,
	MapPin,
	Scale,
	DollarSign,
	AlertTriangle,
	Clock,
	CheckCircle,
	Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { BatchService, type Batch } from '@/services/batchService';
import { toast } from 'sonner';

// Format date helper
const formatDate = (dateString: string): string => {
	const date = new Date(dateString);
	return date.toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'long',
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

// Calculate status based on days left
const calculateStatus = (
	daysLeft: number,
): 'critical' | 'warning' | 'normal' => {
	if (daysLeft <= 2) return 'critical';
	if (daysLeft <= 5) return 'warning';
	return 'normal';
};

const statusStyles = {
	critical: 'bg-red-500/10 text-red-500 border-red-500/20',
	warning: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
	normal: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
};

const UseStock = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [quantityToUse, setQuantityToUse] = useState<number>(0);

	const batchId = id ? parseInt(id, 10) : 0;

	// Query for batch details
	const {
		data: batch,
		isLoading: isLoadingBatch,
		isError: isErrorBatch,
		error: batchError,
	} = useQuery({
		queryKey: ['batch', batchId],
		queryFn: () => BatchService.getBatchById(batchId),
		enabled: batchId > 0,
	});

	// Mutation to update batch quantity
	const updateBatchMutation = useMutation({
		mutationFn: (data: { quantity: number }) =>
			BatchService.updateBatch(batchId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['batch', batchId] });
			queryClient.invalidateQueries({ queryKey: ['expiring-batches'] });
			queryClient.invalidateQueries({ queryKey: ['all-batches'] });
			toast.success('Stock Updated', {
				description: 'Batch quantity has been updated successfully',
			});
			navigate('/inventory/expiring');
		},
		onError: (error: Error) => {
			toast.error('Update Failed', {
				description: error.message || 'Failed to update batch quantity',
			});
		},
	});

	const daysLeft = batch ? calculateDaysLeft(batch.expiryDate) : 0;
	const status = batch ? calculateStatus(daysLeft) : 'normal';

	// Handle quantity change
	const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = parseFloat(e.target.value) || 0;
		setQuantityToUse(Math.max(0, value));
	};

	// Handle use stock
	const handleUseStock = async () => {
		if (!batch || quantityToUse <= 0) {
			toast.error('Invalid Quantity', {
				description: 'Please enter a valid quantity to use',
			});
			return;
		}

		if (quantityToUse > batch.quantity) {
			toast.error('Insufficient Stock', {
				description: 'Cannot use more than the available quantity',
			});
			return;
		}

		const newQuantity = batch.quantity - quantityToUse;
		updateBatchMutation.mutate({ quantity: newQuantity });
	};

	// Loading state
	if (isLoadingBatch) {
		return (
			<MainLayout
				title='Use Stock'
				subtitle='Manage batch stock usage'>
				<div className='flex items-center justify-center h-64'>
					<div className='animate-spin rounded-full h-32 w-32 border-b-2 border-primary'></div>
				</div>
			</MainLayout>
		);
	}

	// Error state
	if (isErrorBatch || !batch) {
		return (
			<MainLayout
				title='Use Stock'
				subtitle='Manage batch stock usage'>
				<div className='flex items-center justify-center h-64'>
					<div className='text-center'>
						<h2 className='text-2xl font-bold text-red-600 mb-4'>Error</h2>
						<p className='text-muted-foreground'>
							{batchError instanceof Error
								? batchError.message
								: 'Failed to load batch details'}
						</p>
						<Button
							variant='outline'
							className='mt-4'
							onClick={() => navigate('/inventory/expiring')}>
							<ArrowLeft className='h-4 w-4 mr-2' />
							Back to Expiring Products
						</Button>
					</div>
				</div>
			</MainLayout>
		);
	}

	return (
		<MainLayout
			title='Use Stock'
			subtitle={`Manage stock for ${batch.batchNumber}`}>
			<div className='space-y-6'>
				{/* Back Button */}
				<Button
					variant='ghost'
					onClick={() => navigate('/inventory/expiring')}
					className='mb-4'>
					<ArrowLeft className='h-4 w-4 mr-2' />
					Back to Expiring Products
				</Button>

				{/* Batch Details Card */}
				<Card className='glass-card'>
					<CardHeader className='pb-4'>
						<div className='flex items-start justify-between'>
							<div>
								<CardTitle className='text-2xl font-bold text-foreground'>
									{batch.inventoryItem?.name || 'Unknown Item'}
								</CardTitle>
								<p className='text-muted-foreground mt-1'>
									{batch.batchNumber}
								</p>
							</div>
							<Badge className={cn('text-sm', statusStyles[status])}>
								{status === 'critical' && (
									<AlertTriangle className='h-3 w-3 mr-1' />
								)}
								{daysLeft} days until expiry
							</Badge>
						</div>
					</CardHeader>
					<CardContent className='space-y-6'>
						{/* Progress Bar */}
						<div className='space-y-2'>
							<div className='flex justify-between text-sm'>
								<span className='text-muted-foreground'>Expiry Progress</span>
								<span className='text-foreground font-medium'>
									{daysLeft} days left
								</span>
							</div>
							<Progress
								value={Math.max(0, Math.min(100, ((14 - daysLeft) / 14) * 100))}
								className={cn(
									'h-3',
									daysLeft <= 2
										? 'bg-red-500'
										: daysLeft <= 5
											? 'bg-amber-500'
											: 'bg-emerald-500',
								)}
							/>
						</div>

						{/* Batch Details Grid */}
						<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
							<div className='bg-card/50 rounded-lg p-4 border border-border/50'>
								<div className='flex items-center gap-2 text-muted-foreground mb-2'>
									<Package className='h-4 w-4' />
									<span className='text-sm'>Quantity</span>
								</div>
								<p className='text-2xl font-bold text-foreground'>
									{batch.quantity}{' '}
									<span className='text-sm font-normal'>
										{batch.inventoryItem?.unit || 'units'}
									</span>
								</p>
							</div>

							<div className='bg-card/50 rounded-lg p-4 border border-border/50'>
								<div className='flex items-center gap-2 text-muted-foreground mb-2'>
									<Calendar className='h-4 w-4' />
									<span className='text-sm'>Received</span>
								</div>
								<p className='text-lg font-medium text-foreground'>
									{formatDate(batch.receivedAt)}
								</p>
							</div>

							<div className='bg-card/50 rounded-lg p-4 border border-border/50'>
								<div className='flex items-center gap-2 text-muted-foreground mb-2'>
									<Clock className='h-4 w-4' />
									<span className='text-sm'>Expires</span>
								</div>
								<p className='text-lg font-medium text-foreground'>
									{formatDate(batch.expiryDate)}
								</p>
							</div>

							<div className='bg-card/50 rounded-lg p-4 border border-border/50'>
								<div className='flex items-center gap-2 text-muted-foreground mb-2'>
									<MapPin className='h-4 w-4' />
									<span className='text-sm'>Location</span>
								</div>
								<p className='text-lg font-medium text-foreground'>
									{batch.inventoryItem?.location || 'N/A'}
								</p>
							</div>
						</div>

						{/* Item Details */}
						<div className='border-t border-border/50 pt-6'>
							<h3 className='text-lg font-semibold text-foreground mb-4'>
								Item Details
							</h3>
							<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
								<div>
									<p className='text-sm text-muted-foreground'>Category</p>
									<p className='font-medium text-foreground'>
										{batch.inventoryItem?.categoryId
											? `Category ${batch.inventoryItem.categoryId}`
											: 'N/A'}
									</p>
								</div>
								<div>
									<p className='text-sm text-muted-foreground'>Unit Price</p>
									<p className='font-medium text-foreground'>
										{batch.inventoryItem?.price.toLocaleString()} TZS/
										{batch.inventoryItem?.unit}
									</p>
								</div>
								<div>
									<p className='text-sm text-muted-foreground'>Supplier</p>
									<p className='font-medium text-foreground'>
										{batch.inventoryItem?.supplier || 'N/A'}
									</p>
								</div>
								<div>
									<p className='text-sm text-muted-foreground'>
										Storage Location
									</p>
									<p className='font-medium text-foreground'>
										{batch.inventoryItem?.storageLocation || 'N/A'}
									</p>
								</div>
							</div>
						</div>

						{/* Use Stock Form */}
						<div className='border-t border-border/50 pt-6'>
							<h3 className='text-lg font-semibold text-foreground mb-4'>
								Use Stock
							</h3>
							<div className='flex flex-col sm:flex-row gap-4 items-end'>
								<div className='flex-1 w-full'>
									<Label
										htmlFor='quantity'
										className='text-muted-foreground mb-2 block'>
										Quantity to Use
									</Label>
									<div className='relative'>
										<Input
											id='quantity'
											type='number'
											min='0'
											max={batch.quantity}
											value={quantityToUse || ''}
											onChange={handleQuantityChange}
											placeholder={`Max: ${batch.quantity} ${batch.inventoryItem?.unit || 'units'}`}
											className='pr-12'
										/>
										<span className='absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground'>
											{batch.inventoryItem?.unit || 'units'}
										</span>
									</div>
								</div>
								<Button
									onClick={handleUseStock}
									disabled={
										quantityToUse <= 0 ||
										quantityToUse > batch.quantity ||
										updateBatchMutation.isPending
									}
									className='gradient-primary shadow-glow w-full sm:w-auto'>
									{updateBatchMutation.isPending ? (
										<>
											<Loader2 className='h-4 w-4 mr-2 animate-spin' />
											Updating...
										</>
									) : (
										<>
											<CheckCircle className='h-4 w-4 mr-2' />
											Use {quantityToUse} {batch.inventoryItem?.unit || 'units'}
										</>
									)}
								</Button>
							</div>

							{quantityToUse > 0 && (
								<div className='mt-4 p-4 bg-card/50 rounded-lg border border-border/50'>
									<div className='flex items-center justify-between'>
										<span className='text-muted-foreground'>
											Remaining after use:
										</span>
										<span className='text-xl font-bold text-foreground'>
											{batch.quantity - quantityToUse}{' '}
											{batch.inventoryItem?.unit || 'units'}
										</span>
									</div>
								</div>
							)}
						</div>
					</CardContent>
				</Card>
			</div>
		</MainLayout>
	);
};

export default UseStock;
