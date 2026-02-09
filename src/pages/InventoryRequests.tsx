import { useState, useEffect, useCallback } from 'react';
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Check, X, Clock, Flame, Wine, Loader2, AlertCircle } from "lucide-react";
import { InventoryService } from "@/services/inventoryService";
import type { StockRequest, StockRequestStatus, Department } from "@/types/inventory.types";
import { useToast } from "@/components/ui/use-toast";

const statusStyles: Record<StockRequestStatus, string> = {
	pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
	approved: "bg-blue-500/10 text-blue-500 border-blue-500/20",
	fulfilled: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
	rejected: "bg-red-500/10 text-red-500 border-red-500/20",
};

const sourceStyles: Record<Department, string> = {
	KITCHEN: "bg-orange-500/10 text-orange-500 border-orange-500/20",
	BAR: "bg-purple-500/10 text-purple-500 border-purple-500/20",
	SERVICE: "bg-blue-500/10 text-blue-500 border-blue-500/20",
	OPERATIONS: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
	MANAGEMENT: "bg-slate-500/10 text-slate-500 border-slate-500/20",
};

const InventoryRequests = () => {
	const { toast } = useToast();
	const [requests, setRequests] = useState<StockRequest[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState("");

	// Fetch stock requests from API
	const fetchRequests = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);
			const data = await InventoryService.getAllStockRequests();
			setRequests(data);
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Failed to fetch stock requests';
			setError(message);
			toast({
				title: "Error",
				description: message,
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	}, [toast]);

	// Initial fetch
	useEffect(() => {
		fetchRequests();
	}, [fetchRequests]);

	// Handle approve/reject actions
	const handleStatusUpdate = async (id: number, status: 'approved' | 'rejected') => {
		try {
			await InventoryService.updateStockRequestStatus(id, { status });
			toast({
				title: "Success",
				description: `Request ${status} successfully`,
				variant: "default",
			});
			fetchRequests(); // Refresh data
		} catch (err) {
			const message = err instanceof Error ? err.message : `Failed to ${status} request`;
			toast({
				title: "Error",
				description: message,
				variant: "destructive",
			});
		}
	};

	// Calculate summary statistics
	const pendingCount = requests.filter(r => r.status === 'pending').length;
	const kitchenCount = requests.filter(r => r.requestedFrom === 'KITCHEN').length;
	const barCount = requests.filter(r => r.requestedFrom === 'BAR').length;
	const fulfilledToday = requests.filter(r => 
		r.status === 'fulfilled' && 
		new Date(r.fulfilledAt || r.requestedAt).toDateString() === new Date().toDateString()
	).length;

	// Filter requests based on search
	const filteredRequests = requests.filter(request => {
		const searchLower = searchTerm.toLowerCase();
		return (
			request.requestId?.toLowerCase().includes(searchLower) ||
			request.requestedBy?.toLowerCase().includes(searchLower) ||
			request.requestItems?.some(item => 
				item.item?.name?.toLowerCase().includes(searchLower)
			) ||
			request.requestedFrom?.toLowerCase().includes(searchLower)
		);
	});

	// Format date
	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	// Get item display name
	const getItemDisplayName = (request: StockRequest) => {
		if (request.requestItems && request.requestItems.length > 0) {
			if (request.requestItems.length === 1) {
				return request.requestItems[0].item?.name || 'Unknown Item';
			}
			return `${request.requestItems[0].item?.name} (+${request.requestItems.length - 1} more)`;
		}
		return 'No items';
	};

	// Get total quantity
	const getTotalQuantity = (request: StockRequest) => {
		if (request.requestItems && request.requestItems.length > 0) {
			return request.requestItems.reduce((sum, item) => sum + item.quantity, 0);
		}
		return 0;
	};

	if (loading && requests.length === 0) {
		return (
			<MainLayout title="Inventory Requests" subtitle="Manage stock requests from kitchen and bar">
				<div className="flex items-center justify-center h-64">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
				</div>
			</MainLayout>
		);
	}

	return (
		<MainLayout title="Inventory Requests" subtitle="Manage stock requests from kitchen and bar">
			<div className="space-y-6">
				{/* Summary Cards */}
				<div className="grid gap-4 md:grid-cols-4">
					<Card className="glass-card">
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
								<Clock className="h-4 w-4" />
								Pending
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-amber-500">{pendingCount}</div>
						</CardContent>
					</Card>
					<Card className="glass-card">
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
								<Flame className="h-4 w-4" />
								Kitchen Requests
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-orange-500">{kitchenCount}</div>
						</CardContent>
					</Card>
					<Card className="glass-card">
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
								<Wine className="h-4 w-4" />
								Bar Requests
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-purple-500">{barCount}</div>
						</CardContent>
					</Card>
					<Card className="glass-card">
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
								<Check className="h-4 w-4" />
								Fulfilled Today
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-emerald-500">{fulfilledToday}</div>
						</CardContent>
					</Card>
				</div>

				{/* Error Display */}
				{error && (
					<Card className="glass-card border-red-500/20">
						<CardContent className="p-4 flex items-center gap-3 text-red-500">
							<AlertCircle className="h-5 w-5" />
							<span>{error}</span>
							<Button 
								variant="ghost" 
								size="sm" 
								onClick={fetchRequests}
								className="ml-auto"
							>
								Retry
							</Button>
						</CardContent>
					</Card>
				)}

				{/* Search and Filters */}
				<div className="flex items-center gap-4">
					<div className="relative flex-1 max-w-md">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input 
							placeholder="Search requests..." 
							className="pl-9 glass-card" 
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
					</div>
					<Button onClick={fetchRequests} variant="outline" size="sm">
						<Loader2 className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
						Refresh
					</Button>
				</div>

				{/* Requests List */}
				<Card className="glass-card">
					<CardContent className="p-0">
						<div className="overflow-x-auto">
							{filteredRequests.length === 0 ? (
								<div className="p-8 text-center text-muted-foreground">
									{searchTerm ? 'No requests match your search' : 'No inventory requests found'}
								</div>
							) : (
								<table className="w-full">
									<thead>
										<tr className="border-b border-border">
											<th className="text-left p-4 text-sm font-medium text-muted-foreground">ID</th>
											<th className="text-left p-4 text-sm font-medium text-muted-foreground">Date</th>
											<th className="text-left p-4 text-sm font-medium text-muted-foreground">Source</th>
											<th className="text-left p-4 text-sm font-medium text-muted-foreground">Item</th>
											<th className="text-left p-4 text-sm font-medium text-muted-foreground">Quantity</th>
											<th className="text-left p-4 text-sm font-medium text-muted-foreground">Requested By</th>
											<th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
											<th className="text-left p-4 text-sm font-medium text-muted-foreground">Actions</th>
										</tr>
									</thead>
									<tbody>
										{filteredRequests.map((request) => (
											<tr key={request.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
												<td className="p-4 text-sm font-medium text-foreground">{request.requestId}</td>
												<td className="p-4 text-sm text-muted-foreground">{formatDate(request.requestedAt)}</td>
												<td className="p-4">
													<Badge className={sourceStyles[request.requestedFrom]}>
														{request.requestedFrom === 'KITCHEN' ? (
															<Flame className="h-3 w-3 mr-1" />
														) : request.requestedFrom === 'BAR' ? (
															<Wine className="h-3 w-3 mr-1" />
														) : null}
														{request.requestedFrom}
													</Badge>
												</td>
												<td className="p-4 text-sm text-foreground">{getItemDisplayName(request)}</td>
												<td className="p-4 text-sm text-foreground">{getTotalQuantity(request)}</td>
												<td className="p-4 text-sm text-muted-foreground">{request.requestedBy || 'Unknown'}</td>
												<td className="p-4">
													<Badge className={statusStyles[request.status]}>
														{request.status}
													</Badge>
												</td>
												<td className="p-4">
													{request.status === 'pending' && (
														<div className="flex items-center gap-2">
															<Button 
																size="sm" 
																variant="ghost" 
																className="h-8 w-8 p-0 text-emerald-500 hover:bg-emerald-500/10"
																onClick={() => handleStatusUpdate(request.id, 'approved')}
																disabled={loading}
															>
																<Check className="h-4 w-4" />
															</Button>
															<Button 
																size="sm" 
																variant="ghost" 
																className="h-8 w-8 p-0 text-red-500 hover:bg-red-500/10"
																onClick={() => handleStatusUpdate(request.id, 'rejected')}
																disabled={loading}
															>
																<X className="h-4 w-4" />
															</Button>
														</div>
													)}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							)}
						</div>
					</CardContent>
				</Card>
			</div>
		</MainLayout>
	);
};

export default InventoryRequests;
