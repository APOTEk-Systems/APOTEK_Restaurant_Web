import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
	ArrowUpDown,
	Package,
	CheckCircle2,
	Plus,
	X,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { InventoryService } from '@/services/inventoryService';
import type {
	DepartmentInventoryItem,
	StockRequest,
	CreateStockRequestItem,
	StockRequestStatus,
} from '@/types/inventory.types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

export default function KitchenInventory() {
	const [searchQuery, setSearchQuery] = useState('');
	const [activeTab, setActiveTab] = useState('items');
	const [selectedItem, setSelectedItem] =
		useState<DepartmentInventoryItem | null>(null);
	const [updateAmount, setUpdateAmount] = useState('');
	const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
	const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
	const [requestItemsList, setRequestItemsList] = useState<
		CreateStockRequestItem[]
	>([]);
	const [searchItemQuery, setSearchItemQuery] = useState('');
	const [autocompleteItems, setAutocompleteItems] = useState<
		DepartmentInventoryItem[]
	>([]);
	const { toast } = useToast();
	const queryClient = useQueryClient();

	// Query for inventory items
	const {
		data: inventoryItems,
		isLoading: inventoryLoading,
		isError: inventoryError,
	} = useQuery({
		queryKey: ['kitchen-inventory'],
		queryFn: () => InventoryService.getDepartmentInventory('KITCHEN'),
	});

	// Query for stock requests
	const {
		data: stockRequests,
		isLoading: requestsLoading,
		isError: requestsError,
	} = useQuery({
		queryKey: ['kitchen-stock-requests'],
		queryFn: () => InventoryService.getStockRequestsByDepartment('KITCHEN'),
	});

	// Mutation for creating stock requests
	const createStockRequestMutation = useMutation({
		mutationFn: (requestData: {
			requestedFrom: 'KITCHEN';
			requestItems: CreateStockRequestItem[];
		}) => InventoryService.createStockRequest(requestData),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['kitchen-stock-requests'] });
			toast({
				title: 'Success',
				description: 'Stock request created successfully!',
				variant: 'default',
			});
			setIsRequestModalOpen(false);
			setRequestItemsList([]);
		},
		onError: (error: Error) => {
			toast({
				title: 'Error',
				description: error.message,
				variant: 'destructive',
			});
		},
	});

	// Mutation for updating stock request status
	const updateStockRequestStatusMutation = useMutation({
		mutationFn: ({
			id,
			status,
		}: {
			id: number;
			status: StockRequestStatus;
			resolution?: string;
		}) => InventoryService.updateStockRequestStatus(id, { status }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['kitchen-stock-requests'] });
			toast({
				title: 'Success',
				description: 'Stock request status updated!',
				variant: 'default',
			});
		},
		onError: (error: Error) => {
			toast({
				title: 'Error',
				description: error.message,
				variant: 'destructive',
			});
		},
	});

	// Filter inventory items for display and search
	const filteredItems =
		inventoryItems?.filter(
			(item) =>
				item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				item.categoryName.toLowerCase().includes(searchQuery.toLowerCase()),
		) || [];

	// Filter requests for display and search
	const filteredRequests =
		stockRequests?.filter(
			(item) =>
				item.requestId.toLowerCase().includes(searchQuery.toLowerCase()) ||
				item.requestItems.some((reqItem) =>
					reqItem.item.name.toLowerCase().includes(searchQuery.toLowerCase()),
				),
		) || [];

	const handleUpdateClick = (item: DepartmentInventoryItem) => {
		setSelectedItem(item);
		setUpdateAmount('');
		setIsUpdateModalOpen(true);
	};

	const handleUpdateSubmit = () => {
		if (
			!updateAmount ||
			isNaN(parseFloat(updateAmount)) ||
			parseFloat(updateAmount) <= 0
		) {
			alert('Please enter a valid amount');
			return;
		}

		console.log(
			`Updating inventory for ${selectedItem?.name}: used ${updateAmount} ${selectedItem?.unit}`,
		);
		// In a real app, this would call an API to update the inventory
		setIsUpdateModalOpen(false);
	};

	const handleAddItemToRequest = (item: DepartmentInventoryItem) => {
		const existingItem = requestItemsList.find(
			(reqItem) => reqItem.itemId === item.id,
		);
		if (!existingItem) {
			setRequestItemsList([
				...requestItemsList,
				{ itemId: item.id, quantity: 1 },
			]);
		}
		setSearchItemQuery('');
	};

	const handleRemoveItemFromRequest = (itemId: number) => {
		setRequestItemsList(
			requestItemsList.filter((reqItem) => reqItem.itemId !== itemId),
		);
	};

	const handleSubmitRequest = () => {
		if (requestItemsList.length === 0) {
			alert('Please add at least one item to your request');
			return;
		}

		createStockRequestMutation.mutate({
			requestedFrom: 'KITCHEN' as const,
			requestItems: requestItemsList,
		});
	};

	const handleUpdateRequestStatus = (
		id: number,
		status: StockRequestStatus,
	) => {
		updateStockRequestStatusMutation.mutate({ id, status });
	};

	const handleSearchItem = (query: string) => {
		setSearchItemQuery(query);
		if (query) {
			const filtered =
				inventoryItems?.filter((item) =>
					item.name.toLowerCase().includes(query.toLowerCase()),
				) || [];
			setAutocompleteItems(filtered);
		} else {
			setAutocompleteItems([]);
		}
	};

	if (inventoryLoading || requestsLoading) {
		return (
			<MainLayout title='Kitchen Inventory'>
				<div className='flex items-center justify-center h-64'>
					<div className='animate-spin rounded-full h-32 w-32 border-b-2 border-primary'></div>
				</div>
			</MainLayout>
		);
	}

	if (inventoryError || requestsError) {
		return (
			<MainLayout title='Kitchen Inventory'>
				<div className='flex items-center justify-center h-64'>
					<div className='text-center'>
						<h2 className='text-2xl font-bold text-red-600 mb-4'>Error</h2>
						<p className='text-muted-foreground'>
							Failed to load inventory data
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
		<MainLayout title='Kitchen Inventory'>
			<div className='space-y-4'>
				<div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'></div>

				{/* Tabs */}
				<Tabs
					value={activeTab}
					onValueChange={setActiveTab}
					className='w-full'>
					<TabsList className='bg-muted/50 w-full'>
						<TabsTrigger
							value='items'
							className='flex-1'>
							Items
						</TabsTrigger>
						<TabsTrigger
							value='requests'
							className='flex-1'>
							Requests
						</TabsTrigger>
					</TabsList>

					<TabsContent
						value='items'
						className='mt-6'>
						<div className='space-y-6'>
							{/* Search */}
							<div className='relative max-w-md'>
								<Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
								<Input
									type='text'
									placeholder='Search inventory items...'
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className='pl-9'
								/>
							</div>

							{/* Inventory Table */}
							<Card>
								<CardHeader>
									<CardTitle>Current Stock Levels</CardTitle>
								</CardHeader>
								<CardContent>
									<div className='overflow-x-auto'>
										<Table>
											<TableHeader>
												<TableRow>
													<TableHead className='w-[200px]'>Item Name</TableHead>
													<TableHead>Category</TableHead>
													<TableHead>Current Stock</TableHead>
													<TableHead>Unit</TableHead>
													<TableHead className='text-right'>Actions</TableHead>
												</TableRow>
											</TableHeader>
											<TableBody>
												{filteredItems.map((item) => (
													<TableRow key={item.id}>
														<TableCell className='font-medium'>
															{item.name}
														</TableCell>
														<TableCell>{item.categoryName}</TableCell>
														<TableCell>
															<Badge
																variant={
																	item.currentStock > 0
																		? 'default'
																		: 'destructive'
																}>
																{item.currentStock}
															</Badge>
														</TableCell>
														<TableCell>{item.unit}</TableCell>
														<TableCell className='text-right'>
															<Button
																variant='ghost'
																size='sm'
																onClick={() => handleUpdateClick(item)}>
																Use
															</Button>
														</TableCell>
													</TableRow>
												))}
											</TableBody>
										</Table>
									</div>
								</CardContent>
							</Card>
						</div>
					</TabsContent>

					<TabsContent
						value='requests'
						className='mt-6'>
						<div className='space-y-6'>
							{/* Search */}
							<div className='relative max-w-md'>
								<Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
								<Input
									type='text'
									placeholder='Search requests...'
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className='pl-9'
								/>
							</div>

							{/* Requests Table */}
							<Card>
								<CardHeader>
									<CardTitle>Inventory Requests</CardTitle>
								</CardHeader>
								<CardContent>
									<div className='overflow-x-auto'>
										<Table>
											<TableHeader>
												<TableRow>
													<TableHead>Request ID</TableHead>
													<TableHead>Items</TableHead>
													<TableHead>Count</TableHead>
													<TableHead>Requested At</TableHead>
													<TableHead>Status</TableHead>
													<TableHead className='text-right'>Actions</TableHead>
												</TableRow>
											</TableHeader>
											<TableBody>
												{filteredRequests.map((item) => (
													<TableRow key={item.id}>
														<TableCell className='font-medium'>
															{item.requestId}
														</TableCell>
														<TableCell>
															{item.requestItems
																.map((reqItem) => reqItem.item.name)
																.join(', ')}
														</TableCell>
														<TableCell>
															{item.requestItems.reduce(
																(sum, reqItem) => sum + reqItem.quantity,
																0,
															)}
														</TableCell>
														<TableCell>
															{new Date(item.requestedAt).toLocaleString()}
														</TableCell>
														<TableCell>
															<Badge
																variant={
																	item.status === 'pending'
																		? 'secondary'
																		: 'default'
																}>
																{item.status}
															</Badge>
														</TableCell>
														<TableCell className='text-right'>
															{item.status === 'pending' ? (
																<div className='flex gap-1 justify-end'>
																	<Button
																		variant='ghost'
																		size='sm'
																		onClick={() =>
																			handleUpdateRequestStatus(
																				item.id,
																				'approved',
																			)
																		}>
																		Approve
																	</Button>
																	<Button
																		variant='ghost'
																		size='sm'
																		onClick={() =>
																			handleUpdateRequestStatus(
																				item.id,
																				'rejected',
																			)
																		}>
																		Reject
																	</Button>
																</div>
															) : (
																<CheckCircle2 className='h-4 w-4 text-green-500' />
															)}
														</TableCell>
													</TableRow>
												))}
											</TableBody>
										</Table>
									</div>
								</CardContent>
							</Card>

							{/* Request Button */}
							<Button onClick={() => setIsRequestModalOpen(true)}>
								<Plus className='mr-2 h-4 w-4' />
								New Request
							</Button>
						</div>
					</TabsContent>
				</Tabs>

				{/* Update Modal */}
				<Dialog
					open={isUpdateModalOpen}
					onOpenChange={setIsUpdateModalOpen}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Update Stock Level</DialogTitle>
						</DialogHeader>
						<div className='space-y-4'>
							<div>
								<Label htmlFor='item-name'>Item</Label>
								<Input
									id='item-name'
									value={selectedItem?.name}
									disabled
									className='mt-1'
								/>
							</div>
							<div>
								<Label htmlFor='current-stock'>Current Stock</Label>
								<Input
									id='current-stock'
									value={`${selectedItem?.currentStock} ${selectedItem?.unit}`}
									disabled
									className='mt-1'
								/>
							</div>
							<div>
								<Label htmlFor='update-amount'>Amount Used</Label>
								<Input
									id='update-amount'
									type='number'
									placeholder='Enter amount'
									value={updateAmount}
									onChange={(e) => setUpdateAmount(e.target.value)}
									className='mt-1'
								/>
							</div>
						</div>
						<DialogFooter className='mt-6'>
							<Button
								variant='outline'
								onClick={() => setIsUpdateModalOpen(false)}>
								Cancel
							</Button>
							<Button onClick={handleUpdateSubmit}>Update Stock</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>

				{/* Request Modal */}
				<Dialog
					open={isRequestModalOpen}
					onOpenChange={setIsRequestModalOpen}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>New Inventory Request</DialogTitle>
						</DialogHeader>
						<div className='space-y-4'>
							<div>
								<Label htmlFor='request-items'>Items</Label>
								<div className='mt-1 space-y-2'>
									{requestItemsList.map((reqItem) => {
										const item = inventoryItems?.find(
											(invItem) => invItem.id === reqItem.itemId,
										);
										return (
											<div
												key={reqItem.itemId}
												className='flex items-center justify-between'>
												<div>
													<span className='font-medium'>{item?.name}</span>
													<span className='text-sm text-muted-foreground ml-2'>
														({reqItem.quantity} {item?.unit})
													</span>
												</div>
												<Button
													variant='ghost'
													size='sm'
													onClick={() =>
														handleRemoveItemFromRequest(reqItem.itemId)
													}>
													<X className='h-4 w-4' />
												</Button>
											</div>
										);
									})}
								</div>
							</div>
							<div>
								<Label htmlFor='search-item'>Add Item</Label>
								<div className='mt-1 relative'>
									<Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
									<Input
										id='search-item'
										type='text'
										placeholder='Search items...'
										value={searchItemQuery}
										onChange={(e) => handleSearchItem(e.target.value)}
										className='pl-9'
									/>
									{searchItemQuery && (
										<div className='absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto'>
											{autocompleteItems.map((item) => (
												<div
													key={item.id}
													className='px-3 py-2 hover:bg-muted cursor-pointer'
													onClick={() => handleAddItemToRequest(item)}>
													{item.name}
												</div>
											))}
										</div>
									)}
								</div>
							</div>
						</div>
						<DialogFooter className='mt-6'>
							<Button
								variant='outline'
								onClick={() => setIsRequestModalOpen(false)}>
								Cancel
							</Button>
							<Button
								onClick={handleSubmitRequest}
								disabled={createStockRequestMutation.isPending}>
								{createStockRequestMutation.isPending ? (
									<>
										<span className='animate-spin mr-2'>🌀</span> Creating...
									</>
								) : (
									'Submit Request'
								)}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
		</MainLayout>
	);
}
