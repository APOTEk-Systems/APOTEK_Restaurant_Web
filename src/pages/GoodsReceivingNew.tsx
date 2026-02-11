import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, Trash2, Loader2 } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useState, useMemo, useEffect } from 'react';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { GoodsReceivingService } from '@/services/goodsReceivingService';
import { PurchaseOrderService } from '@/services/purchaseOrderService';
import type {
	CreateGoodsReceivingDto,
	CreateGoodsReceivingItemDto,
	GoodsReceiving,
	UpdateGoodsReceivingDto,
} from '@/types/goodsReceiving.types';
import type { PurchaseOrder, PurchaseItem } from '@/types/purchaseOrder.types';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery } from '@tanstack/react-query';

interface ReceivingItem {
	inventoryItemId: string;
	name: string;
	unit: string;
	quantityExpected: number;
	quantityReceived: number;
}

export default function GoodsReceivingNew() {
	const { id } = useParams();
	const isEditMode = !!id;
	const [selectedPO, setSelectedPO] = useState('');
	const [receivingItems, setReceivingItems] = useState<ReceivingItem[]>([]);
	const [receivedDate, setReceivedDate] = useState(
		new Date().toISOString().split('T')[0],
	);
	const [notes, setNotes] = useState('');
	const navigate = useNavigate();
	const { toast } = useToast();

	// Query for fetching existing goods receiving record (edit mode)
	const { data: existingRecord, isLoading: existingLoading } = useQuery({
		queryKey: ['goodsReceiving', id],
		queryFn: async () => {
			if (!id) return null;
			const response = await GoodsReceivingService.getGoodsReceivingById(id);
			return response;
		},
		enabled: !!id,
		retry: false,
	});

	// Load existing record data when in edit mode
	useEffect(() => {
		if (existingRecord) {
			setSelectedPO(String(existingRecord.purchaseOrderId || ''));
			setReceivedDate(
				existingRecord.receivedAt
					? new Date(existingRecord.receivedAt).toISOString().split('T')[0]
					: new Date().toISOString().split('T')[0],
			);
			setNotes(existingRecord.notes || '');

			// Load items from receivedItems if available
			if (existingRecord.receivedItems && existingRecord.receivedItems.length > 0) {
				const items: ReceivingItem[] = existingRecord.receivedItems.map((item) => {
					const invItem = item.inventoryItem;
					return {
						inventoryItemId: String(item.inventoryItemId),
						name: invItem?.name || 'Unknown Item',
						unit: invItem?.unit || 'units',
						quantityExpected: 0, // We don't have expected quantity in edit mode
						quantityReceived: item.quantityReceived,
					};
				});
				setReceivingItems(items);
			}
		}
	}, [existingRecord]);

	// Query for fetching purchase orders
	const { data: purchaseOrders = [], isLoading: poLoading } = useQuery({
		queryKey: ['purchaseOrdersForReceiving'],
		queryFn: async () => {
			const response = await PurchaseOrderService.getAllPurchaseOrders();
			return response;
		},
		retry: false,
	});

	const { data: poDetails } = useQuery({
		queryKey: ['purchaseOrder', selectedPO],
		queryFn: async () => {
			if (!selectedPO) return null;
			const response =
				await PurchaseOrderService.getPurchaseOrderById(selectedPO);
			return response;
		},
		enabled: !!selectedPO && !isEditMode, // Only load PO details in create mode
		retry: false,
	});

	// Debug log to see poDetails structure
	useEffect(() => {
		if (poDetails) {
			console.log('poDetails:', poDetails);
			const poData = poDetails as unknown as Record<string, unknown>;
			console.log('supplier_id:', poData?.supplier_id);
		}
	}, [poDetails]);

	// Helper to extract supplierId from various possible sources
	const getSupplierIdFromPO = (): number => {
		if (existingRecord?.supplierId) {
			return Number(existingRecord.supplierId);
		}
		// Cast poDetails to unknown then to Record for accessing snake_case fields
		const poData = poDetails as unknown as Record<string, unknown>;
		// Try snake_case from API
		const snakeSupplierId = poData?.supplier_id;
		if (snakeSupplierId) {
			return Number(snakeSupplierId);
		}
		// Try camelCase
		const camelSupplierId = poData?.supplierId;
		if (camelSupplierId) {
			return Number(camelSupplierId);
		}
		// Try nested supplier object
		const nestedSupplier = poData?.supplier as { id?: number } | undefined;
		if (nestedSupplier?.id) {
			return Number(nestedSupplier.id);
		}
		// Try purchaseOrder.supplier_id
		const purchaseOrderData = poData?.purchaseOrder as Record<string, unknown> | undefined;
		const poNestedSupplierId = purchaseOrderData?.supplier_id;
		if (poNestedSupplierId) {
			return Number(poNestedSupplierId);
		}
		return 0;
	};

	// Load PO items when selecting a PO in create mode
	useEffect(() => {
		if (poDetails && poDetails.items && receivingItems.length === 0 && !isEditMode) {
			const items: ReceivingItem[] = poDetails.items.map(
				(item: PurchaseItem) => {
					const itemData = item as unknown as Record<string, unknown>;
					const invItemId =
						(itemData.inventory_item_id as number) ||
						(itemData.inventoryItemId as number) ||
						item.id ||
						0;
					const invName = (itemData.name as string) || 'Unknown Item';
					const qtyOrdered =
						(itemData.quantity_ordered as number) ||
						(itemData.quantityOrdered as number) ||
						item.quantity ||
						0;
					const unit = (itemData.unit as string) || 'units';
					return {
						inventoryItemId: String(invItemId),
						name: invName,
						unit: unit,
						quantityExpected: Number(qtyOrdered),
						quantityReceived: 0,
					};
				},
			);
			setReceivingItems(items);
		}
	}, [poDetails, receivingItems.length, isEditMode]);

	const createMutation = useMutation({
		mutationFn: async (data: CreateGoodsReceivingDto) => {
			const response = await GoodsReceivingService.createGoodsReceiving(data);
			return response;
		},
		onSuccess: () => {
			toast({
				title: 'Success',
				description: 'Goods receiving record created successfully',
			});
			navigate('/purchases/receiving');
		},
		onError: (error: unknown) => {
			const err = error as Record<string, unknown>;
			const response = err?.response as Record<string, unknown>;
			const data = response?.data as Record<string, unknown>;
			const message =
				data?.message || data?.error || JSON.stringify(data) || 'Failed to create';
			toast({
				title: 'Error',
				description: String(message),
				variant: 'destructive',
			});
		},
	});

	const updateMutation = useMutation({
		mutationFn: async (data: { id: string; data: Partial<UpdateGoodsReceivingDto> }) => {
			const response = await GoodsReceivingService.updateGoodsReceiving(data.id, data.data);
			return response;
		},
		onSuccess: () => {
			toast({
				title: 'Success',
				description: 'Goods receiving record updated successfully',
			});
			navigate('/purchases/receiving');
		},
		onError: (error: unknown) => {
			const err = error as Record<string, unknown>;
			const response = err?.response as Record<string, unknown>;
			const data = response?.data as Record<string, unknown>;
			const message =
				data?.message || data?.error || JSON.stringify(data) || 'Failed to update';
			toast({
				title: 'Error',
				description: String(message),
				variant: 'destructive',
			});
		},
	});

	const isSubmitting = createMutation.isPending || updateMutation.isPending;
	const isLoading = poLoading || existingLoading;

	const totalExpected = useMemo(
		() => receivingItems.reduce((sum, item) => sum + item.quantityExpected, 0),
		[receivingItems],
	);
	const totalReceived = useMemo(
		() => receivingItems.reduce((sum, item) => sum + item.quantityReceived, 0),
		[receivingItems],
	);

	const updateQuantityReceived = (index: number, quantity: number) => {
		if (quantity < 0) return;
		setReceivingItems((prev) =>
			prev.map((item, i) =>
				i === index ? { ...item, quantityReceived: quantity } : item,
			),
		);
	};

	const removeItem = (index: number) => {
		setReceivingItems((prev) => prev.filter((_, i) => i !== index));
	};

	const handleCreateGoodsReceiving = () => {
		if (!selectedPO || receivingItems.length === 0) {
			toast({
				title: 'Validation Error',
				description: 'Please select a purchase order and add items',
				variant: 'destructive',
			});
			return;
		}

		const items: CreateGoodsReceivingItemDto[] = receivingItems.map((item) => ({
			inventoryItemId: parseInt(item.inventoryItemId) || 0,
			quantityReceived: item.quantityReceived,
		}));

		const supplierId = getSupplierIdFromPO();
		console.log('Creating with supplierId:', supplierId);
		console.log('Creating with purchaseOrderId:', parseInt(selectedPO));

		if (supplierId <= 0) {
			toast({
				title: 'Validation Error',
				description: 'Unable to determine supplier ID from purchase order',
				variant: 'destructive',
			});
			return;
		}

		const createData: CreateGoodsReceivingDto = {
			purchaseOrderId: parseInt(selectedPO) || 0,
			supplierId,
			receivedAt: new Date(receivedDate).toISOString(),
			notes: notes || undefined,
			receivedItems: items,
		};

		createMutation.mutate(createData);
	};

	const handleUpdateGoodsReceiving = () => {
		if (!id) return;

		const items: CreateGoodsReceivingItemDto[] = receivingItems.map((item) => ({
			inventoryItemId: parseInt(item.inventoryItemId) || 0,
			quantityReceived: item.quantityReceived,
		}));

		const supplierId = getSupplierIdFromPO();

		const updateData: Partial<UpdateGoodsReceivingDto> = {
			purchaseOrderId: parseInt(selectedPO) || undefined,
			supplierId: supplierId > 0 ? supplierId : undefined,
			receivedAt: new Date(receivedDate).toISOString(),
			notes: notes || undefined,
			receivedItems: items,
		};

		updateMutation.mutate({ id, data: updateData });
	};

	if (isLoading) {
		return (
			<MainLayout title={isEditMode ? 'Edit Goods Receiving' : 'Record Goods Receiving'} subtitle='Loading...'>
				<div className='flex items-center justify-center py-12'>
					<Loader2 className='h-8 w-8 animate-spin text-primary' />
				</div>
			</MainLayout>
		);
	}

	return (
		<MainLayout
			title={isEditMode ? 'Edit Goods Receiving' : 'Record Goods Receiving'}
			subtitle={isEditMode ? 'Update existing receiving record' : 'Record incoming deliveries from purchase orders'}>
			<div className='space-y-6 animate-fade-in'>
				<Link to='/purchases/receiving'>
					<Button variant='ghost' className='gap-2'>
						<ArrowLeft className='h-4 w-4' />
						Back to Goods Receiving
					</Button>
				</Link>

				<Card className='shadow-card border-border/50'>
					<CardHeader>
						<CardTitle className='text-lg'>
							{isEditMode ? 'Edit Goods Receiving Record' : 'Create Goods Receiving Record'}
						</CardTitle>
					</CardHeader>
					<CardContent className='space-y-6'>
						<div className='space-y-2'>
							<Label htmlFor='purchaseOrder' className='text-sm font-medium'>
								Purchase Order *
							</Label>
							{poLoading ? (
								<div className='flex items-center gap-2 text-muted-foreground'>
									<Loader2 className='h-4 w-4 animate-spin' />
									Loading purchase orders...
								</div>
							) : (
								<Select
									value={selectedPO}
									onValueChange={setSelectedPO}
									disabled={isEditMode || isSubmitting}>
									<SelectTrigger id='purchaseOrder' className='w-full'>
										<SelectValue placeholder='Select a purchase order' />
									</SelectTrigger>
									<SelectContent>
										{purchaseOrders.length > 0 ? (
											purchaseOrders.map((po: PurchaseOrder) => (
												<SelectItem key={po.id} value={po.id!}>
													{po.poNumber || po.id}
												</SelectItem>
											))
										) : (
											<div className='p-2 text-sm text-muted-foreground'>
												No purchase orders found
											</div>
										)}
									</SelectContent>
								</Select>
							)}
						</div>

						<div className='space-y-2'>
							<Label htmlFor='receivedDate' className='text-sm font-medium'>
								Received Date *
							</Label>
							<Input
								id='receivedDate'
								type='date'
								value={receivedDate}
								onChange={(e) => setReceivedDate(e.target.value)}
								disabled={isSubmitting}
							/>
						</div>

						<div className='space-y-4'>
							<Label className='text-sm font-medium'>Received Items *</Label>
							{receivingItems.length > 0 ? (
								<div className='overflow-x-auto'>
									<table className='w-full'>
										<thead className='bg-muted/50'>
											<tr>
												<th className='text-left px-4 py-3 text-sm font-medium text-muted-foreground'>
													Item
												</th>
												<th className='text-center px-4 py-3 text-sm font-medium text-muted-foreground'>
													Expected
												</th>
												<th className='text-center px-4 py-3 text-sm font-medium text-muted-foreground'>
													Received
												</th>
												<th className='text-center px-4 py-3 text-sm font-medium text-muted-foreground'>
													Unit
												</th>
												<th className='text-right px-4 py-3 text-sm font-medium text-muted-foreground'>
													Actions
												</th>
											</tr>
										</thead>
										<tbody className='divide-y divide-border'>
											{receivingItems.map((item, index) => (
												<tr key={index} className='hover:bg-muted/30'>
													<td className='px-4 py-3 font-medium'>{item.name}</td>
													<td className='px-4 py-3 text-center text-muted-foreground'>
														{item.quantityExpected || '-'}
													</td>
													<td className='px-4 py-3'>
														<Input
															type='number'
															min={0}
															value={item.quantityReceived}
															onChange={(e) =>
																updateQuantityReceived(index, parseInt(e.target.value) || 0)
															}
															className='h-8 w-20 mx-auto text-center'
															disabled={isSubmitting}
														/>
													</td>
													<td className='px-4 py-3 text-center text-muted-foreground'>
														{item.unit}
													</td>
													<td className='px-4 py-3 text-right'>
														<Button
															variant='ghost'
															size='icon'
															className='h-8 w-8 text-destructive hover:text-destructive'
															onClick={() => removeItem(index)}
															disabled={isSubmitting}>
															<Trash2 className='h-4 w-4' />
														</Button>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							) : (
								<div className='text-center py-8 text-muted-foreground border border-dashed border-border rounded-lg'>
									No items to display. Select a purchase order to load items.
								</div>
							)}
							{receivingItems.length > 0 && (
								<div className='grid grid-cols-3 gap-4 pt-4 border-t border-border'>
									<div className='text-center'>
										<p className='text-sm text-muted-foreground'>Total Expected</p>
										<p className='text-lg font-semibold'>{totalExpected || '-'}</p>
									</div>
									<div className='text-center'>
										<p className='text-sm text-muted-foreground'>Total Received</p>
										<p className='text-lg font-semibold text-primary'>{totalReceived}</p>
									</div>
									<div className='text-center'>
										<p className='text-sm text-muted-foreground'>Remaining</p>
										<p className='text-lg font-semibold text-warning'>
											{totalExpected - totalReceived || '-'}
										</p>
									</div>
								</div>
							)}
						</div>

						<div className='space-y-2'>
							<Label htmlFor='notes' className='text-sm font-medium'>
								Notes
							</Label>
							<Input
								id='notes'
								value={notes}
								onChange={(e) => setNotes(e.target.value)}
								placeholder='Optional notes...'
								disabled={isSubmitting}
							/>
						</div>

						<div className='flex gap-3 pt-4'>
							<Link to='/purchases/receiving' className='flex-1'>
								<Button variant='outline' className='w-full' disabled={isSubmitting}>
									Cancel
								</Button>
							</Link>
							<Button
								onClick={isEditMode ? handleUpdateGoodsReceiving : handleCreateGoodsReceiving}
								className='flex-1 gradient-primary text-primary-foreground shadow-glow hover:shadow-lg transition-shadow'
								disabled={!selectedPO || receivingItems.length === 0 || isSubmitting}>
								{isSubmitting ? (
									<>
										<Loader2 className='h-4 w-4 mr-2 animate-spin' />
										{isEditMode ? 'Updating...' : 'Creating...'}
									</>
								) : (
									<>
										<Plus className='h-4 w-4 mr-2' />
										{isEditMode ? 'Update Receiving' : 'Record Receiving'}
									</>
								)}
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		</MainLayout>
	);
}
