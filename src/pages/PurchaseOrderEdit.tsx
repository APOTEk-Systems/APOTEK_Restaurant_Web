import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
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
import { SupplierService } from '@/services/supplierService';
import { InventoryService } from '@/services/inventoryService';
import { PurchaseOrderService } from '@/services/purchaseOrderService';
import type { Supplier } from '@/types/supplier.types';
import type {
	PurchaseItem,
	UpdatePurchaseOrderDto,
} from '@/types/purchaseOrder.types';
import type { InventoryItem } from '@/types/inventory.types';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';


const STATUS_OPTIONS = [
	{ value: 'PENDING', label: 'Pending' },
	{ value: 'APPROVED', label: 'Approved' },
	{ value: 'ORDERED', label: 'Ordered' },
	{ value: 'PARTIALLY_RECEIVED', label: 'Partially Received' },
	{ value: 'COMPLETED', label: 'Completed' },
	{ value: 'CANCELLED', label: 'Cancelled' },
];

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

// Transform API response items to PurchaseItem format
interface ApiPurchaseItem {
	id: number;
	inventoryItemId: number;
	quantityOrdered: number;
	unitPrice: number;
	inventoryItem?: {
		id: number;
		name: string;
		unit?: string;
	};
}

const transformItems = (apiItems: ApiPurchaseItem[]): PurchaseItem[] => {
	return apiItems.map((item) => ({
		id: item.inventoryItemId,
		name: item.inventoryItem?.name || `Item ${item.inventoryItemId}`,
		unit: item.inventoryItem?.unit || 'units',
		quantity: item.quantityOrdered,
		price: item.unitPrice,
	}));
};

// API Response type with camelCase fields
interface ApiPurchaseOrder {
	id: string;
	poNumber?: string;
	supplierId?: number;
	supplier_id?: number;
	supplier?: { id: number; name: string };
	status: string;
	notes?: string;
	orderedAt?: string;
	expectedDeliveryAt?: string;
	delivery_date?: string;
	deliveryDate?: string;
	items: ApiPurchaseItem[];
	createdAt?: string;
	updatedAt?: string;
}

export default function PurchaseOrderEdit() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { toast } = useToast();
	const queryClient = useQueryClient();

	// Form state
	const [selectedSupplier, setSelectedSupplier] = useState<string>('');
	const [selectedSupplierDetails, setSelectedSupplierDetails] =
		useState<Supplier | null>(null);
	const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([]);
	const [deliveryDate, setDeliveryDate] = useState('');
	const [status, setStatus] = useState('');

	// Query for fetching purchase order by ID
	const {
		data: rawPurchaseOrder,
		isLoading: purchaseOrderLoading,
		error: purchaseOrderError,
	} = useQuery({
		queryKey: ['purchaseOrder', id],
		queryFn: async () => {
			if (!id) throw new Error('No purchase order ID provided');
			const response = await PurchaseOrderService.getPurchaseOrderById(id);
			return response;
		},
		enabled: !!id,
		retry: false,
	});

	// Initialize form data when purchase order is loaded
	useEffect(() => {
		if (rawPurchaseOrder) {
			// Cast to API response type to handle camelCase fields
			const purchaseOrder = rawPurchaseOrder as unknown as ApiPurchaseOrder;

			console.log('[PurchaseOrderEdit] Loaded purchase order:', purchaseOrder);
			console.log('[PurchaseOrderEdit] Items:', purchaseOrder.items);

			// Handle both camelCase (supplierId) and snake_case (supplier_id)
			setSelectedSupplier(
				purchaseOrder.supplierId?.toString() ||
					purchaseOrder.supplier_id?.toString() ||
					purchaseOrder.supplier?.id?.toString() ||
					'',
			);

			// Transform items from API format to PurchaseItem format
			if (purchaseOrder.items && purchaseOrder.items.length > 0) {
				setPurchaseItems(transformItems(purchaseOrder.items));
			} else {
				setPurchaseItems([]);
			}

			setStatus(purchaseOrder.status || 'PENDING');

			// Handle delivery date - check both camelCase and snake_case
			const deliveryDateValue =
				purchaseOrder.expectedDeliveryAt ||
				purchaseOrder.delivery_date ||
				purchaseOrder.deliveryDate;
			if (deliveryDateValue) {
				const date = new Date(deliveryDateValue);
				setDeliveryDate(date.toISOString().split('T')[0]);
			}
		}
	}, [rawPurchaseOrder]);

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
	useEffect(() => {
		if (supplierDetails) {
			setSelectedSupplierDetails(supplierDetails);
		}
	}, [supplierDetails]);

	// Query for fetching inventory items
	const { data: inventoryItems = [], isLoading: inventoryLoading } = useQuery({
		queryKey: ['inventoryItems'],
		queryFn: async () => {
			const response = await InventoryService.getAllInventoryItems();
			return response;
		},
		retry: false,
	});

	// Mutation for updating purchase order
	const updateMutation = useMutation({
		mutationFn: async (data: UpdatePurchaseOrderDto) => {
			if (!id) throw new Error('No purchase order ID provided');
			console.log(
				'[PurchaseOrderEdit] Updating with data:',
				JSON.stringify(data, null, 2),
			);
			const response = await PurchaseOrderService.updatePurchaseOrder(id, data);
			return response;
		},
		onSuccess: () => {
			toast({
				title: 'Success',
				description: 'Purchase order updated successfully',
			});
			queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] });
			queryClient.invalidateQueries({ queryKey: ['purchaseOrder', id] });
			navigate('/purchases');
		},
		onError: (error: unknown) => {
			console.error('[PurchaseOrderEdit] Update error:', error);
			const err = error as Record<string, unknown>;
			const response = err?.response as Record<string, unknown>;
			const data = response?.data as Record<string, unknown>;
			const message =
				data?.message ||
				data?.error ||
				JSON.stringify(data) ||
				'Failed to update purchase order';
			toast({
				title: 'Error',
				description: String(message),
				variant: 'destructive',
			});
		},
	});

	const isSubmitting = updateMutation.isPending;

	// Calculate totals
	const subtotal = useMemo(() => {
		return purchaseItems.reduce(
			(sum, item) => sum + (item.price || 0) * (item.quantity || 0),
			0,
		);
	}, [purchaseItems]);

	// Use supplier tax rate if available, otherwise default to 10%
	const taxRate = selectedSupplierDetails?.tax_rate ?? 0.1;
	const tax = Math.round((subtotal * taxRate + Number.EPSILON) * 100) / 100;
	const total = Math.round((subtotal + tax + Number.EPSILON) * 100) / 100;

	const updateQuantity = (itemId: number, quantity: number) => {
		if (quantity < 1) return;
		setPurchaseItems(
			purchaseItems.map((item) =>
				item.id === itemId ? { ...item, quantity } : item,
			),
		);
	};

	const updatePrice = (itemId: number, price: number) => {
		setPurchaseItems(
			purchaseItems.map((item) =>
				item.id === itemId ? { ...item, price: Math.max(0, price) } : item,
			),
		);
	};

	const handleUpdatePurchaseOrder = () => {
		if (!id) {
			toast({
				title: 'Error',
				description: 'No purchase order ID provided',
				variant: 'destructive',
			});
			return;
		}

		// Convert delivery date to ISO-8601 DateTime format
		const delivery_date = deliveryDate
			? new Date(deliveryDate + 'T00:00:00.000Z').toISOString()
			: undefined;

		// Create payload - only send fields that have changed
		// Backend expects uppercase status enum values
		const updateData = {
			...(selectedSupplier && { supplierId: parseInt(selectedSupplier, 10) }),
			...(purchaseItems.length > 0 && {
				items: purchaseItems.map((item) => ({
					inventoryItemId: item.id,
					quantityOrdered: item.quantity,
					unitPrice: Math.round((item.price + Number.EPSILON) * 100) / 100,
				})),
			}),
			...(deliveryDate && { expectedDeliveryAt: delivery_date }),
			...(status && { status }),
		};

		updateMutation.mutate(updateData as unknown as UpdatePurchaseOrderDto);
	};

	// Helper to find inventory item by ID
	const findInventoryItem = (itemId: string): InventoryItem | undefined => {
		return inventoryItems.find((item) => item.id === Number(itemId));
	};

	// Loading state
	if (purchaseOrderLoading) {
		return (
			<MainLayout
				title='Edit Purchase Order'
				subtitle='Loading purchase order...'>
				<div className='flex flex-col items-center justify-center py-12 text-center'>
					<Loader2 className='h-8 w-8 animate-spin text-primary mb-4' />
					<p className='text-muted-foreground'>
						Loading purchase order details...
					</p>
				</div>
			</MainLayout>
		);
	}

	// Error state
	if (purchaseOrderError || !rawPurchaseOrder) {
		return (
			<MainLayout
				title='Edit Purchase Order'
				subtitle='Error loading purchase order'>
				<div className='flex flex-col items-center justify-center py-12 text-center'>
					<div className='bg-destructive/10 text-destructive p-4 rounded-full mb-4'>
						<Loader2 className='h-8 w-8' />
					</div>
					<h2 className='text-xl font-semibold text-foreground mb-2'>
						Error Loading Purchase Order
					</h2>
					<p className='text-muted-foreground mb-4'>
						Unable to load purchase order. Please check the ID and try again.
					</p>
					<Link to='/purchases'>
						<Button variant='outline'>Back to Purchase Orders</Button>
					</Link>
				</div>
			</MainLayout>
		);
	}

	// Get order ID for display
	const purchaseOrder = rawPurchaseOrder as unknown as ApiPurchaseOrder;
	const getOrderId = (): string => {
		const poNumber = purchaseOrder.poNumber;
		if (poNumber) return poNumber;
		return purchaseOrder.id || 'N/A';
	};

	return (
		<MainLayout
			title={`Edit Purchase Order - ${getOrderId()}`}
			subtitle='Update purchase order details'>
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

				{/* Purchase Order Edit Form */}
				<Card className='shadow-card border-border/50'>
					<CardHeader>
						<CardTitle className='text-lg'>Order Details</CardTitle>
					</CardHeader>
					<CardContent className='space-y-6'>
						{/* Order Info Row */}
						<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
							{/* Order ID (Read-only) */}
							<div className='space-y-2'>
								<Label className='text-sm font-medium'>Order ID</Label>
								<Input
									value={getOrderId()}
									readOnly
									className='bg-muted/50'
								/>
							</div>

							{/* Status */}
							<div className='space-y-2'>
								<Label className='text-sm font-medium'>Status *</Label>
								<Select
									value={status}
									onValueChange={setStatus}
									disabled={isSubmitting}>
									<SelectTrigger>
										<SelectValue placeholder='Select status' />
									</SelectTrigger>
									<SelectContent>
										{STATUS_OPTIONS.map((option) => (
											<SelectItem
												key={option.value}
												value={option.value}>
												{option.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							{/* Delivery Date */}
							<div className='space-y-2'>
								<Label className='text-sm font-medium'>
									Expected Delivery Date
								</Label>
								<Input
									type='date'
									value={deliveryDate}
									onChange={(e) => setDeliveryDate(e.target.value)}
									disabled={isSubmitting}
								/>
							</div>
						</div>

						{/* Supplier Selection */}
						<div className='space-y-2'>
							<Label className='text-sm font-medium'>Supplier *</Label>
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
									<SelectTrigger className='w-full'>
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

						{/* Items Section */}
						<div className='space-y-4'>
							<div className='flex items-center justify-between'>
								<Label className='text-sm font-medium'>Items</Label>
							</div>

							{purchaseItems.length > 0 ? (
								<div className='space-y-3 border-t border-border pt-4'>
									<div className='grid grid-cols-7 gap-3 text-xs font-medium text-muted-foreground pb-2'>
										<div className='col-span-2'>Item</div>
										<div className='text-center'>Quantity</div>
										<div className='text-center'>Unit</div>
										<div className='text-right'>Price</div>
										<div className='text-right'>Total</div>
										<div></div>
									</div>

									{purchaseItems.map((item) => (
										<div
											key={item.id}
											className='grid grid-cols-7 gap-3 items-center py-2 border-b border-border/50'>
											<div className='col-span-2 font-medium'>{item.name}</div>
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
													className='h-8 w-20 mx-auto text-center'
													disabled={isSubmitting}
												/>
											</div>
											<div className='text-center text-muted-foreground'>
												{item.unit}
											</div>
											<div className='text-right'>
												<Input
													type='number'
													step='0.01'
													min='0'
													value={item.price}
													onChange={(e) =>
														updatePrice(
															item.id,
															parseFloat(e.target.value) || 0,
														)
													}
													className='h-8 w-24 text-right'
													disabled={isSubmitting}
												/>
											</div>
											<div className='text-right font-semibold'>
												{formatCurrency(item.price * item.quantity)}
											</div>
											<div></div>
										</div>
									))}
								</div>
							) : (
								<div className='text-center py-8 text-muted-foreground'>
									No items in this order
								</div>
							)}

							{/* Order Summary */}
							<div className='mt-6 pt-4 border-t border-border space-y-3'>
								<div className='flex justify-between text-sm'>
									<span className='text-muted-foreground'>Subtotal</span>
									<span className='font-semibold'>
										{formatCurrency(subtotal)}
									</span>
								</div>
								<div className='flex justify-between text-sm'>
									<span className='text-muted-foreground'>
										Tax ({(taxRate * 100).toFixed(0)}%)
									</span>
									<span className='font-semibold'>{formatCurrency(tax)}</span>
								</div>
								<div className='flex justify-between text-lg font-bold pt-2 border-t border-border'>
									<span>Total</span>
									<span className='text-primary'>{formatCurrency(total)}</span>
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
									onClick={handleUpdatePurchaseOrder}
									className='flex-1 gap-2'
									disabled={isSubmitting}>
									{isSubmitting ? (
										<>
											<Loader2 className='h-4 w-4 animate-spin' />
											Saving...
										</>
									) : (
										<>
											<Save className='h-4 w-4' />
											Save Changes
										</>
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
