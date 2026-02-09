import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, Trash2, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useMemo } from 'react';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { SupplierService } from '@/services/supplierService';
import { InventoryService } from '@/services/inventoryService';
import { PurchaseOrderService } from '@/services/purchaseOrderService';
import type { Supplier } from '@/types/supplier.types';
import type {
	PurchaseItem,
	CreatePurchaseOrderDto,
} from '@/types/purchaseOrder.types';
import type { InventoryItem } from '@/types/inventory.types';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery } from '@tanstack/react-query';

export default function PurchaseOrderNew() {
	const [selectedSupplier, setSelectedSupplier] = useState('');
	const [selectedSupplierDetails, setSelectedSupplierDetails] =
		useState<Supplier | null>(null);
	const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([]);
	const [newItem, setNewItem] = useState({
		itemId: '',
		quantity: 1,
	});
	const [deliveryDate, setDeliveryDate] = useState('');
	const navigate = useNavigate();
	const { toast } = useToast();

	// Query for fetching suppliers
	const { data: suppliers = [], isLoading: suppliersLoading } = useQuery({
		queryKey: ['suppliers'],
		queryFn: async () => {
			const response = await SupplierService.getAllSuppliers();
			return response;
		},
		retry: false,
	});

	// Query for fetching supplier details when a supplier is selected
	const { data: supplierDetails } = useQuery({
		queryKey: ['supplier', selectedSupplier],
		queryFn: async () => {
			if (!selectedSupplier) return null;
			const response = await SupplierService.getSupplierById(
				Number(selectedSupplier),
			);
			return response;
		},
		enabled: !!selectedSupplier,
		retry: false,
	});

	// Update supplier details when data changes
	useState(() => {
		if (supplierDetails) {
			setSelectedSupplierDetails(supplierDetails);
		}
	});

	// Query for fetching inventory items
	const { data: inventoryItems = [], isLoading: inventoryLoading } = useQuery({
		queryKey: ['inventoryItems'],
		queryFn: async () => {
			const response = await InventoryService.getAllInventoryItems();
			return response;
		},
		retry: false,
	});

	// Mutation for creating purchase order
	const createMutation = useMutation({
		mutationFn: async (data: CreatePurchaseOrderDto) => {
			console.log(
				'[PurchaseOrder] Creating with data:',
				JSON.stringify(data, null, 2),
			);
			const response = await PurchaseOrderService.createPurchaseOrder(data);
			return response;
		},
		onSuccess: () => {
			toast({
				title: 'Success',
				description: 'Purchase order created successfully',
			});
			navigate('/purchases');
		},
		onError: (error: unknown) => {
			console.error('[PurchaseOrder] Error:', error);
			const err = error as Record<string, unknown>;
			const response = err?.response as Record<string, unknown>;
			const data = response?.data as Record<string, unknown>;
			const message =
				data?.message ||
				data?.error ||
				JSON.stringify(data) ||
				'Failed to create purchase order';
			toast({
				title: 'Error',
				description: String(message),
				variant: 'destructive',
			});
		},
	});

	const isSubmitting = createMutation.isPending;

	// Generate PO number
	const poNumber = `PO-${Date.now()}`;

	// Get current timestamp for orderedAt
	const orderedAt = new Date().toISOString();

	// Calculate totals
	const subtotal = useMemo(() => {
		return purchaseItems.reduce(
			(sum, item) => sum + item.price * item.quantity,
			0,
		);
	}, [purchaseItems]);

	// Use supplier tax rate if available, otherwise default to 10%
	const taxRate = selectedSupplierDetails?.tax_rate ?? 0.1;
	const tax = Math.round((subtotal * taxRate + Number.EPSILON) * 100) / 100;
	const total = Math.round((subtotal + tax + Number.EPSILON) * 100) / 100;

	const addItem = () => {
		if (!newItem.itemId) return;

		const selectedItem = inventoryItems.find(
			(item) => item.id === Number(newItem.itemId),
		);
		if (!selectedItem) return;

		const existingItem = purchaseItems.find(
			(item) => item.id === selectedItem.id,
		);
		if (existingItem) {
			setPurchaseItems(
				purchaseItems.map((item) =>
					item.id === selectedItem.id
						? { ...item, quantity: item.quantity + newItem.quantity }
						: item,
				),
			);
		} else {
			setPurchaseItems([
				...purchaseItems,
				{
					id: selectedItem.id,
					name: selectedItem.name,
					unit: selectedItem.unit,
					quantity: newItem.quantity,
					price: selectedItem.price ?? 0,
				},
			]);
		}

		setNewItem({ itemId: '', quantity: 1 });
	};

	const removeItem = (id: number) => {
		setPurchaseItems(purchaseItems.filter((item) => item.id !== id));
	};

	const updateQuantity = (id: number, quantity: number) => {
		if (quantity < 1) return;
		setPurchaseItems(
			purchaseItems.map((item) =>
				item.id === id ? { ...item, quantity } : item,
			),
		);
	};

	const handleCreatePurchaseOrder = () => {
		if (!selectedSupplier || purchaseItems.length === 0 || !deliveryDate) {
			toast({
				title: 'Validation Error',
				description: 'Please fill in all required fields',
				variant: 'destructive',
			});
			return;
		}

		const supplierIdNum = parseInt(selectedSupplier, 10);
		if (isNaN(supplierIdNum)) {
			toast({
				title: 'Validation Error',
				description: 'Invalid supplier selected',
				variant: 'destructive',
			});
			return;
		}

		// Convert delivery date to ISO-8601 DateTime format
		const expectedDeliveryAt = deliveryDate
			? new Date(deliveryDate + 'T00:00:00.000Z').toISOString()
			: '';

		// Create payload matching backend API schema
		const createData = {
			poNumber,
			supplierId: supplierIdNum,
			status: 'PENDING' as const,
			notes: '',
			orderedAt,
			expectedDeliveryAt,
			items: purchaseItems.map((item) => ({
				inventoryItemId: item.id,
				quantityOrdered: item.quantity,
				unitPrice: Math.round((item.price + Number.EPSILON) * 100) / 100,
			})),
		};

		createMutation.mutate(createData as CreatePurchaseOrderDto);
	};

	// Check if form is valid
	const isFormValid =
		selectedSupplier && purchaseItems.length > 0 && deliveryDate;

	// Check if data is loading
	const isLoading = suppliersLoading || inventoryLoading;

	// Helper function to find inventory item by ID
	const findInventoryItem = (itemId: string): InventoryItem | undefined => {
		return inventoryItems.find((item) => item.id === Number(itemId));
	};

	return (
		<MainLayout
			title='Create Purchase Order'
			subtitle='Create a new purchase order for suppliers'>
			<div className='space-y-6 animate-fade-in'>
				{/* Back Button */}
				<Link to='/purchases'>
					<Button
						variant='ghost'
						className='gap-2'>
						<ArrowLeft className='h-4 w-4' />
						Back to Purchase Orders
					</Button>
				</Link>

				{/* Purchase Order Form */}
				<Card className='shadow-card border-border/50'>
					<CardHeader>
						<CardTitle className='text-lg'>Create Purchase Order</CardTitle>
					</CardHeader>
					<CardContent className='space-y-6'>
						{/* Supplier Selection */}
						<div className='space-y-2'>
							<Label
								htmlFor='supplier'
								className='text-sm font-medium'>
								Supplier *
							</Label>
							{suppliersLoading ? (
								<div className='flex items-center gap-2 text-muted-foreground'>
									<Loader2 className='h-4 w-4 animate-spin' />
									Loading suppliers...
								</div>
							) : (
								<Select
									value={selectedSupplier}
									onValueChange={setSelectedSupplier}
									disabled={isSubmitting}>
									<SelectTrigger
										id='supplier'
										className='w-full'>
										<SelectValue placeholder='Select a supplier' />
									</SelectTrigger>
									<SelectContent>
										{suppliers.length > 0 ? (
											suppliers.map((supplier) => (
												<SelectItem
													key={supplier.id}
													value={supplier.id.toString()}>
													{supplier.name}
												</SelectItem>
											))
										) : (
											<div className='p-2 text-sm text-muted-foreground'>
												No suppliers available
											</div>
										)}
									</SelectContent>
								</Select>
							)}
						</div>

						{/* Delivery Date */}
						<div className='space-y-2'>
							<Label
								htmlFor='deliveryDate'
								className='text-sm font-medium'>
								Expected Delivery Date *
							</Label>
							<Input
								id='deliveryDate'
								type='date'
								value={deliveryDate}
								onChange={(e) => setDeliveryDate(e.target.value)}
								min={new Date().toISOString().split('T')[0]}
								disabled={isSubmitting}
							/>
						</div>

						{/* Items Section */}
						<div className='space-y-4'>
							<div className='flex items-center justify-between'>
								<Label className='text-sm font-medium'>Items *</Label>
							</div>

							{/* Add Item Form */}
							<div className='flex flex-col sm:flex-row gap-3 items-end'>
								<div className='flex-1 space-y-2'>
									<Label
										htmlFor='item'
										className='xs text-muted-foreground'>
										Item
									</Label>
									{inventoryLoading ? (
										<div className='flex items-center gap-2 text-muted-foreground'>
											<Loader2 className='h-4 w-4 animate-spin' />
											Loading items...
										</div>
									) : (
										<Select
											value={newItem.itemId}
											onValueChange={(value) =>
												setNewItem({ ...newItem, itemId: value })
											}
											disabled={isSubmitting}>
											<SelectTrigger id='item'>
												<SelectValue placeholder='Select item' />
											</SelectTrigger>
											<SelectContent>
												{inventoryItems.length > 0 ? (
													inventoryItems.map((item) => (
														<SelectItem
															key={item.id}
															value={item.id.toString()}>
															{item.name} ({item.unit})
														</SelectItem>
													))
												) : (
													<div className='p-2 text-sm text-muted-foreground'>
														No items available
													</div>
												)}
											</SelectContent>
										</Select>
									)}
								</div>

								<div className='w-24 space-y-2'>
									<Label
										htmlFor='quantity'
										className='text-xs text-muted-foreground'>
										Quantity
									</Label>
									<Input
										id='quantity'
										type='number'
										min='1'
										value={newItem.quantity}
										onChange={(e) =>
											setNewItem({
												...newItem,
												quantity: parseInt(e.target.value) || 1,
											})
										}
										className='h-9'
										disabled={isSubmitting}
									/>
								</div>

								<div className='w-24 space-y-2'>
									<Label className='text-xs text-muted-foreground'>Unit</Label>
									<Input
										value={findInventoryItem(newItem.itemId)?.unit || ''}
										readOnly
										className='h-9 bg-muted/50'
									/>
								</div>

								<div className='w-24 space-y-2'>
									<Label className='text-xs text-muted-foreground'>Price</Label>
									<Input
										value={
											findInventoryItem(newItem.itemId)?.price?.toFixed(2) ||
											'0.00'
										}
										readOnly
										className='h-9 bg-muted/50'
									/>
								</div>

								<Button
									onClick={addItem}
									className='h-9 gap-2'
									disabled={!newItem.itemId || isSubmitting}>
									<Plus className='h-4 w-4' />
									Add Item
								</Button>
							</div>

							{/* Items List */}
							{purchaseItems.length > 0 && (
								<div className='space-y-3 border-t border-border pt-4'>
									<div className='grid grid-cols-6 gap-3 text-xs font-medium text-muted-foreground pb-2'>
										<div>Item</div>
										<div className='text-center'>Quantity</div>
										<div className='text-center'>Unit</div>
										<div className='text-right'>Price</div>
										<div className='text-right'>Total</div>
										<div></div>
									</div>

									{purchaseItems.map((item) => (
										<div
											key={item.id}
											className='grid grid-cols-6 gap-3 items-center py-2 border-b border-border/50'>
											<div className='font-medium'>{item.name}</div>
											<div className='text-center'>
												<Input
													type='number'
													min='1'
													value={item.quantity}
													onChange={(e) =>
														updateQuantity(
															item.id,
															parseInt(e.target.value) || 1,
														)
													}
													className='h-8 w-16 mx-auto text-center'
													disabled={isSubmitting}
												/>
											</div>
											<div className='text-center text-muted-foreground'>
												{item.unit}
											</div>
											<div className='text-right'>${item.price.toFixed(2)}</div>
											<div className='text-right font-semibold'>
												${(item.price * item.quantity).toFixed(2)}
											</div>
											<div className='flex justify-end'>
												<Button
													variant='ghost'
													size='icon'
													className='h-8 w-8 text-destructive hover:text-destructive'
													onClick={() => removeItem(item.id)}
													disabled={isSubmitting}>
													<Trash2 className='h-4 w-4' />
												</Button>
											</div>
										</div>
									))}
								</div>
							)}

							{/* Order Summary */}
							<div className='mt-6 pt-4 border-t border-border space-y-3'>
								<div className='flex justify-between text-sm'>
									<span className='text-muted-foreground'>Subtotal</span>
									<span className='font-semibold'>${subtotal.toFixed(2)}</span>
								</div>
								<div className='flex justify-between text-sm'>
									<span className='text-muted-foreground'>
										Tax ({(taxRate * 100).toFixed(0)}%)
									</span>
									<span className='font-semibold'>${tax.toFixed(2)}</span>
								</div>
								<div className='flex justify-between text-lg font-bold pt-2 border-t border-border'>
									<span>Total</span>
									<span className='text-primary'>${total.toFixed(2)}</span>
								</div>
							</div>

							{/* Action Buttons */}
							<div className='flex gap-3 pt-4'>
								<Link
									to='/purchases'
									className='flex-1'>
									<Button
										variant='outline'
										className='w-full'
										disabled={isSubmitting}>
										Cancel
									</Button>
								</Link>
								<Button
									onClick={handleCreatePurchaseOrder}
									className='flex-1 gradient-primary text-primary-foreground shadow-glow hover:shadow-lg transition-shadow'
									disabled={!isFormValid || isSubmitting}>
									{isSubmitting ? (
										<>
											<Loader2 className='h-4 w-4 animate-spin mr-2' />
											Creating...
										</>
									) : (
										'Create Purchase Order'
									)}
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</MainLayout>
	);
}
