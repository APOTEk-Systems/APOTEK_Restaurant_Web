import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, ArrowUp, ArrowDown, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { InventoryService } from '@/services/inventoryService';

const typeStyles = {
	increase: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
	decrease: 'bg-red-500/10 text-red-500 border-red-500/20',
	correction: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
};

const typeIcons = {
	increase: ArrowUp,
	decrease: ArrowDown,
	correction: RefreshCw,
};

const InventoryAdjustments = () => {
	const [searchTerm, setSearchTerm] = useState('');

	const {
		data: inventoryAdjustments,
		isLoading: adjustmentsLoading,
		isError: adjustmentsError,
	} = useQuery({
		queryKey: ['inventory-adjustments'],
		queryFn: () => InventoryService.getAllInventoryAdjustments(),
	});

	// Filter adjustments based on search term
	const filteredAdjustments =
		inventoryAdjustments?.filter((adjustment) => {
			const searchLower = searchTerm.toLowerCase();
			return (
				adjustment.adjustmentNumber?.toLowerCase().includes(searchLower) ||
				adjustment.inventoryItem?.name?.toLowerCase().includes(searchLower) ||
				adjustment.adjustmentReason?.name
					?.toLowerCase()
					.includes(searchLower) ||
				adjustment.adjustedBy?.toLowerCase().includes(searchLower)
			);
		}) || [];

	if (adjustmentsLoading) {
		return (
			<MainLayout
				title='Inventory Adjustments'
				subtitle='Track and manage stock level changes'>
				<div className='flex items-center justify-center h-64'>
					<div className='animate-spin rounded-full h-32 w-32 border-b-2 border-primary'></div>
				</div>
			</MainLayout>
		);
	}

	if (adjustmentsError) {
		return (
			<MainLayout
				title='Inventory Adjustments'
				subtitle='Track and manage stock level changes'>
				<div className='flex items-center justify-center h-64'>
					<div className='text-center'>
						<h2 className='text-2xl font-bold text-red-600 mb-4'>Error</h2>
						<p className='text-muted-foreground'>
							Failed to load inventory adjustments
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
			title='Inventory Adjustments'
			subtitle='Track and manage stock level changes'>
			<div className='space-y-6'>
				{/* Action Button */}
				<div className='flex justify-end'>
					<Link to='/inventory-adjustments/new'>
						<Button className='gradient-primary shadow-glow'>
							<Plus className='h-4 w-4 mr-2' />
							New Adjustment
						</Button>
					</Link>
				</div>

				{/* Summary Cards */}
				<div className='grid gap-4 md:grid-cols-3'>
					<Card className='glass-card'>
						<CardHeader className='pb-2'>
							<CardTitle className='text-sm font-medium text-muted-foreground'>
								Today's Adjustments
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold text-foreground'>
								{inventoryAdjustments?.filter((adjustment) => {
									const today = new Date().toISOString().split('T')[0];
									return adjustment.createdAt.split('T')[0] === today;
								}).length || 0}
							</div>
						</CardContent>
					</Card>
					<Card className='glass-card'>
						<CardHeader className='pb-2'>
							<CardTitle className='text-sm font-medium text-muted-foreground'>
								Total Increases
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold text-emerald-500'>
								+
								{inventoryAdjustments
									?.filter(
										(adjustment) => adjustment.adjustmentType === 'increase',
									)
									.reduce((sum, adj) => sum + adj.quantity, 0) || 0}{' '}
								units
							</div>
						</CardContent>
					</Card>
					<Card className='glass-card'>
						<CardHeader className='pb-2'>
							<CardTitle className='text-sm font-medium text-muted-foreground'>
								Total Decreases
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold text-red-500'>
								-
								{inventoryAdjustments
									?.filter(
										(adjustment) => adjustment.adjustmentType === 'decrease',
									)
									.reduce((sum, adj) => sum + adj.quantity, 0) || 0}{' '}
								units
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Search */}
				<div className='flex items-center gap-4'>
					<div className='relative flex-1 max-w-md'>
						<Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
						<Input
							placeholder='Search adjustments...'
							className='pl-9 glass-card'
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
					</div>
				</div>

				{/* Adjustments List */}
				<Card className='glass-card'>
					<CardContent className='p-0'>
						<div className='overflow-x-auto'>
							<table className='w-full'>
								<thead>
									<tr className='border-b border-border'>
										<th className='text-left p-4 text-sm font-medium text-muted-foreground'>
											ID
										</th>
										<th className='text-left p-4 text-sm font-medium text-muted-foreground'>
											Date
										</th>
										<th className='text-left p-4 text-sm font-medium text-muted-foreground'>
											Item
										</th>
										<th className='text-left p-4 text-sm font-medium text-muted-foreground'>
											Type
										</th>
										<th className='text-left p-4 text-sm font-medium text-muted-foreground'>
											Quantity
										</th>
										<th className='text-left p-4 text-sm font-medium text-muted-foreground'>
											Reason
										</th>
										<th className='text-left p-4 text-sm font-medium text-muted-foreground'>
											Adjusted By
										</th>
									</tr>
								</thead>
								<tbody>
									{filteredAdjustments.map((adjustment) => {
										const TypeIcon =
											typeIcons[
												adjustment.adjustmentType as keyof typeof typeIcons
											] || RefreshCw;
										const styleClass =
											typeStyles[
												adjustment.adjustmentType as keyof typeof typeStyles
											] || typeStyles.correction;
										return (
											<tr
												key={adjustment.id}
												className='border-b border-border/50 hover:bg-muted/30 transition-colors'>
												<td className='p-4 text-sm font-medium text-foreground'>
													{adjustment.adjustmentNumber}
												</td>
												<td className='p-4 text-sm text-muted-foreground'>
													{new Date(adjustment.createdAt).toLocaleDateString()}
												</td>
												<td className='p-4 text-sm text-foreground'>
													{adjustment.inventoryItem.name}
												</td>
												<td className='p-4'>
													<Badge className={styleClass}>
														<TypeIcon className='h-3 w-3 mr-1' />
														{adjustment.adjustmentType}
													</Badge>
												</td>
												<td className='p-4 text-sm font-medium'>
													<span
														className={
															adjustment.adjustmentType === 'decrease'
																? 'text-red-500'
																: 'text-emerald-500'
														}>
														{adjustment.adjustmentType === 'decrease'
															? '-'
															: '+'}
														{adjustment.quantity}
													</span>
												</td>
												<td className='p-4 text-sm text-muted-foreground'>
													{adjustment.adjustmentReason.name}
												</td>
												<td className='p-4 text-sm text-muted-foreground'>
													{adjustment.adjustedBy || 'Unknown'}
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>
					</CardContent>
				</Card>
			</div>
		</MainLayout>
	);
};

export default InventoryAdjustments;
