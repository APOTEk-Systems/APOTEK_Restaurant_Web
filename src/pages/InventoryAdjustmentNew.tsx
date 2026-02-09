import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, AlertTriangle, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { InventoryService } from '@/services/inventoryService';
import type { InventoryItem } from '@/types/inventory.types';
import { AdjustmentReasonService } from '@/services/adjustmentReasonService';
import type { AdjustmentReason } from '@/types/adjustmentReason.types';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient, useQuery } from '@tanstack/react-query';

export default function InventoryAdjustmentNew() {
	const navigate = useNavigate();
	const { toast } = useToast();
	const queryClient = useQueryClient();
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Initializing with empty strings to keep components "controlled"
	const [formData, setFormData] = useState({
		inventoryItemId: '',
		quantity: 0,
		adjustmentReasonId: '',
		adjustmentType: 'increase' as 'increase' | 'decrease',
		adjustedBy: '',
		notes: '',
	});

	const { data: inventoryItems = [], isLoading: itemsLoading } = useQuery({
		queryKey: ['inventory-items'],
		queryFn: async () => {
			const data = await InventoryService.getAllInventoryItems();
			console.log('Fetched inventory items:', data);
			return data;
		},
	});

	const { data: adjustmentReasons = [], isLoading: reasonsLoading } = useQuery({
		queryKey: ['adjustment-reasons'],
		queryFn: async () => {
			const data = await AdjustmentReasonService.getAllAdjustmentReasons();
			console.log('Fetched adjustment reasons:', data);
			return data;
		},
	});

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		const { name, value, type } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: type === 'number' ? parseFloat(value) || 0 : value,
		}));
	};

	const handleSelectChange = (name: string, value: string) => {
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));

		// Auto-set adjustment type based on selected reason
		if (name === 'adjustmentReasonId') {
			const selectedReason = adjustmentReasons.find(
				(r) => r.id.toString() === value,
			);
			if (selectedReason && selectedReason.type !== 'both') {
				setFormData((prev) => ({
					...prev,
					adjustmentType: selectedReason.type as 'increase' | 'decrease',
				}));
			}
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (
			!formData.inventoryItemId ||
			!formData.adjustmentReasonId ||
			!formData.adjustedBy.trim()
		) {
			toast({
				variant: 'destructive',
				title: 'Error',
				description: 'Please fill in all required fields.',
			});
			return;
		}

		setIsSubmitting(true);
		try {
			// Convert string IDs back to Numbers for the API
			const payload = {
				...formData,
				inventoryItemId: parseInt(formData.inventoryItemId),
				adjustmentReasonId: parseInt(formData.adjustmentReasonId),
			};

			await InventoryService.createInventoryAdjustment(payload);

			// Invalidate both lists so quantities update everywhere
			queryClient.invalidateQueries({ queryKey: ['inventory-adjustments'] });
			queryClient.invalidateQueries({ queryKey: ['inventory-items'] });

			toast({ title: 'Success', description: 'Adjustment recorded.' });
			navigate('/inventory-adjustments');
		} catch (error) {
			toast({
				variant: 'destructive',
				title: 'Error',
				description: error.message || 'Failed to create adjustment.',
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<MainLayout
			title='New Inventory Adjustment'
			subtitle='Log stock changes'>
			<div className='space-y-6 max-w-3xl'>
				<Button
					variant='ghost'
					onClick={() => navigate(-1)}
					className='gap-2'>
					<ArrowLeft className='h-4 w-4' /> Back
				</Button>

				<form
					onSubmit={handleSubmit}
					className='grid gap-6'>
					<Card>
						<CardHeader>
							<CardTitle className='text-lg flex items-center gap-2'>
								<AlertTriangle className='h-5 w-5 text-yellow-500' />
								Item Details
							</CardTitle>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
								<div className='space-y-2'>
									<Label>Inventory Item *</Label>
									<Select
										value={formData.inventoryItemId}
										onValueChange={(v) =>
											handleSelectChange('inventoryItemId', v)
										}>
										<SelectTrigger>
											<SelectValue
												placeholder={
													itemsLoading ? 'Loading...' : 'Select item'
												}
											/>
										</SelectTrigger>
										<SelectContent>
											{inventoryItems.map((item) => (
												<SelectItem
													key={item.id}
													value={item.id.toString()}>
													{item.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div className='space-y-2'>
									<Label htmlFor='quantity'>Quantity *</Label>
									<Input
										id='quantity'
										name='quantity'
										type='number'
										min='1'
										value={formData.quantity}
										onChange={handleChange}
										required
									/>
								</div>
							</div>
							<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
								<div className='space-y-2'>
									<Label>Adjustment Type *</Label>
									<Select
										value={formData.adjustmentType}
										onValueChange={(v) =>
											handleSelectChange('adjustmentType', v)
										}>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='increase'>Increase (+)</SelectItem>
											<SelectItem value='decrease'>Decrease (-)</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className='space-y-2'>
									<Label htmlFor='adjustedBy'>Adjusted By *</Label>
									<Input
										id='adjustedBy'
										name='adjustedBy'
										value={formData.adjustedBy}
										onChange={handleChange}
										placeholder='Enter your name'
										required
									/>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className='text-lg flex items-center gap-2'>
								<AlertTriangle className='h-5 w-5 text-yellow-500' />
								Reason
							</CardTitle>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='space-y-2'>
								<Label>Reason *</Label>
								<Select
									value={formData.adjustmentReasonId}
									onValueChange={(v) =>
										handleSelectChange('adjustmentReasonId', v)
									}>
									<SelectTrigger>
										<SelectValue
											placeholder={
												reasonsLoading ? 'Loading...' : 'Select reason'
											}
										/>
									</SelectTrigger>
									<SelectContent>
										{adjustmentReasons.map((r) => (
											<SelectItem
												key={r.id}
												value={r.id.toString()}>
												{r.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='notes'>Notes</Label>
								<Textarea
									id='notes'
									name='notes'
									value={formData.notes}
									onChange={handleChange}
									rows={3}
								/>
							</div>
						</CardContent>
					</Card>

					<div className='flex gap-3 justify-end'>
						<Button
							type='button'
							variant='outline'
							onClick={() => navigate('/inventory-adjustments')}
							disabled={isSubmitting}>
							Cancel
						</Button>
						<Button
							type='submit'
							disabled={isSubmitting || itemsLoading}>
							{isSubmitting ? (
								<Loader2 className='mr-2 h-4 w-4 animate-spin' />
							) : (
								<Plus className='h-4 w-4 mr-2' />
							)}
							Create Adjustment
						</Button>
					</div>
				</form>
			</div>
		</MainLayout>
	);
}
