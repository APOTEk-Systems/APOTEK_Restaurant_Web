import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	Plus,
	Search,
	Users,
	Clock,
	Phone,
	Mail,
	MoreHorizontal,
	CheckCircle2,
	XCircle,
	Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ReservationService } from '@/services/reservationService';
import type { Reservation } from '@/types/reservation.types';
import { toast } from '@/hooks/use-toast';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

// Status styles with uppercase keys
const statusStyles: Record<string, string> = {
	PENDING: 'bg-warning/10 text-warning border-warning/20',
	CONFIRMED: 'bg-success/10 text-success border-success/20',
	CANCELLED: 'bg-destructive/10 text-destructive border-destructive/20',
	COMPLETED: 'bg-muted text-muted-foreground border-border',
};

// Helper to format date and time from ISO string
const formatReservationDateTime = (dateString: string) => {
	const date = new Date(dateString);
	return {
		date: date.toLocaleDateString(),
		time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
	};
};

// Helper to get table names from nested structure
const getTableNames = (tables?: Array<{
	table: { number: number };
}>): string[] => {
	if (!tables || tables.length === 0) {
		return [];
	}
	return tables.map((t) => `Table ${t.table.number}`);
};

// Status filter options
const STATUS_FILTERS = [
	{ value: 'all', label: 'All Reservations' },
	{ value: 'PENDING', label: 'Pending' },
	{ value: 'CONFIRMED', label: 'Confirmed' },
	{ value: 'CANCELLED', label: 'Cancelled' },
];

// Helper to check if a date matches the filter date
const isSameDay = (dateString: string, filterDate: Date | undefined): boolean => {
	if (!filterDate) return true;
	const reservationDate = new Date(dateString);
	return (
		reservationDate.getFullYear() === filterDate.getFullYear() &&
		reservationDate.getMonth() === filterDate.getMonth() &&
		reservationDate.getDate() === filterDate.getDate()
	);
};

export default function Reservations() {
	const [date, setDate] = useState<Date | undefined>(undefined);
	const [reservations, setReservations] = useState<Reservation[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState<string>('all');
	const [actionLoading, setActionLoading] = useState<string | null>(null);

	const fetchReservations = async () => {
		try {
			setLoading(true);
			const data = await ReservationService.getAllReservationsWithSummary();
			setReservations(data.reservations);
		} catch (error) {
			toast({
				title: 'Error',
				description: 'Failed to load reservations',
				variant: 'destructive',
			});
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchReservations();
	}, []);

	const handleConfirm = async (id: string) => {
		setActionLoading(id);
		try {
			await ReservationService.confirmReservation(id);
			toast({
				title: 'Success',
				description: 'Reservation confirmed successfully',
				variant: 'default',
			});
			fetchReservations();
		} catch (error) {
			toast({
				title: 'Error',
				description: 'Failed to confirm reservation',
				variant: 'destructive',
			});
		} finally {
			setActionLoading(null);
		}
	};

	const handleCancel = async (id: string) => {
		setActionLoading(id);
		try {
			await ReservationService.cancelReservation(id);
			toast({
				title: 'Reservation Cancelled',
				description: 'The reservation has been cancelled',
				variant: 'default',
			});
			fetchReservations();
		} catch (error) {
			toast({
				title: 'Error',
				description: 'Failed to cancel reservation',
				variant: 'destructive',
			});
		} finally {
			setActionLoading(null);
		}
	};

	// Filter reservations based on search, status, and calendar date
	const filteredReservations = useMemo(() => {
		return reservations.filter((reservation) => {
			const matchesSearch =
				reservation.customerName
					.toLowerCase()
					.includes(searchTerm.toLowerCase()) ||
				reservation.customerPhone.includes(searchTerm) ||
				(reservation.customerEmail &&
					reservation.customerEmail
						.toLowerCase()
						.includes(searchTerm.toLowerCase()));
			const matchesStatus =
				statusFilter === 'all' || reservation.status === statusFilter;
			const matchesDate = isSameDay(reservation.date, date);

			return matchesSearch && matchesStatus && matchesDate;
		});
	}, [reservations, searchTerm, statusFilter, date]);

	// Calculate summary from filtered reservations
	const summary = useMemo(() => {
		return {
			totalReservations: filteredReservations.length,
			totalGuests: filteredReservations.reduce(
				(acc, r) => acc + r.numberOfGuests,
				0,
			),
			tablesReserved: filteredReservations.reduce((acc, r) => {
				if (r.tables && r.tables.length > 0) {
					return acc + r.tables.length;
				}
				return acc + 1;
			}, 0),
			totalTables: 24,
		};
	}, [filteredReservations]);

	// Get selected date display
	const selectedDateDisplay = date
		? date.toLocaleDateString(undefined, {
				weekday: 'long',
				year: 'numeric',
				month: 'long',
				day: 'numeric',
		  })
		: 'All Dates';

	if (loading) {
		return (
			<MainLayout
				title='Reservations'
				subtitle='Manage table bookings and reservations'>
				<div className='flex items-center justify-center h-64'>
					<Loader2 className='h-8 w-8 animate-spin text-primary' />
				</div>
			</MainLayout>
		);
	}

	return (
		<MainLayout
			title='Reservations'
			subtitle='Manage table bookings and reservations'>
			<div className='space-y-6 animate-fade-in'>
				{/* Actions Bar */}
				<div className='flex flex-col sm:flex-row gap-4 justify-between'>
					<div className='flex gap-3'>
						<div className='relative flex-1 sm:w-80'>
							<Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
							<Input
								placeholder='Search by name, phone, or email...'
								className='pl-9'
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
						</div>
						<Select
							value={statusFilter}
							onValueChange={setStatusFilter}>
							<SelectTrigger className='w-48'>
								<SelectValue placeholder='Status' />
							</SelectTrigger>
							<SelectContent>
								{STATUS_FILTERS.map((option) => (
									<SelectItem key={option.value} value={option.value}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<Link to='/reservations/new'>
						<Button className='gradient-primary text-primary-foreground shadow-glow hover:shadow-lg transition-shadow'>
							<Plus className='h-4 w-4 mr-2' />
							New Reservation
						</Button>
					</Link>
				</div>

				<div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
					{/* Calendar & Summary */}
					<div className='bg-card rounded-xl shadow-card border border-border/50 p-4'>
						<Calendar
							mode='single'
							selected={date}
							onSelect={setDate}
							className='rounded-md'
						/>
						{date && (
							<Button
								variant='ghost'
								size='sm'
								className='w-full mt-2 text-muted-foreground'
								onClick={() => setDate(undefined)}>
								Show All Dates
							</Button>
						)}
						<div className='mt-4 pt-4 border-t border-border'>
							<h4 className='font-medium text-foreground mb-2'>
								{date ? 'Selected Date' : "Today's Summary"}
							</h4>
							<p className='text-sm text-muted-foreground mb-4'>
								{selectedDateDisplay}
							</p>
							<div className='space-y-2 text-sm'>
								<div className='flex justify-between'>
									<span className='text-muted-foreground'>
										Total Reservations
									</span>
									<span className='font-medium text-foreground'>
										{summary.totalReservations}
									</span>
								</div>
								<div className='flex justify-between'>
									<span className='text-muted-foreground'>Total Guests</span>
									<span className='font-medium text-foreground'>
										{summary.totalGuests}
									</span>
								</div>
								<div className='flex justify-between'>
									<span className='text-muted-foreground'>
										Tables Reserved
									</span>
									<span className='font-medium text-foreground'>
										{summary.tablesReserved}/{summary.totalTables}
									</span>
								</div>
							</div>
						</div>
					</div>

					{/* Reservations List */}
					<div className='lg:col-span-2 space-y-4'>
						{filteredReservations.length === 0 ? (
							<div className='text-center py-12 text-muted-foreground'>
								<Users className='h-12 w-12 mx-auto mb-4 opacity-50' />
								<p>No reservations found</p>
								{date && (
									<Button
										variant='link'
										onClick={() => setDate(undefined)}
										className='mt-2'>
										Clear date filter
									</Button>
								)}
							</div>
						) : (
							filteredReservations.map((reservation) => {
								const { date: dateStr, time } = formatReservationDateTime(
									reservation.date,
								);
								const tableNames = getTableNames(reservation.tables);

								return (
									<div
										key={reservation.id}
										className='bg-card rounded-xl p-5 shadow-card border border-border/50 hover:shadow-card-hover transition-all duration-300'>
										<div className='flex items-start justify-between mb-3'>
											<div>
												<div className='flex items-center gap-2'>
													<h3 className='font-semibold text-foreground'>
														{reservation.customerName}
													</h3>
													<Badge
														className={cn(
															'capitalize',
															statusStyles[reservation.status] ||
																statusStyles.COMPLETED,
														)}>
														{reservation.status.toLowerCase()}
													</Badge>
												</div>
												<p className='text-sm text-muted-foreground mt-1'>
													{tableNames.length > 0
														? tableNames.join(', ')
														: 'Table assignment pending'}
												</p>
											</div>
											<div className='flex items-center gap-1'>
												{reservation.status === 'PENDING' && (
													<>
														<Button
															variant='ghost'
															size='icon'
															className='h-8 w-8 text-success hover:text-success hover:bg-success/10'
															onClick={() =>
																handleConfirm(reservation.id)
															}
															disabled={
																actionLoading === reservation.id
															}
															title='Confirm reservation'>
															{actionLoading === reservation.id ? (
																<Loader2 className='h-4 w-4 animate-spin' />
															) : (
																<CheckCircle2 className='h-4 w-4' />
															)}
														</Button>
														<Button
															variant='ghost'
															size='icon'
															className='h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10'
															onClick={() =>
																handleCancel(reservation.id)
															}
															disabled={
																actionLoading === reservation.id
															}
															title='Cancel reservation'>
															{actionLoading === reservation.id ? (
																<Loader2 className='h-4 w-4 animate-spin' />
															) : (
																<XCircle className='h-4 w-4' />
															)}
														</Button>
													</>
												)}
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button
															variant='ghost'
															size='icon'
															className='h-8 w-8'>
															<MoreHorizontal className='h-4 w-4' />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent
														align='end'
														className='w-48'>
														<DropdownMenuItem asChild>
															<Link
																to={`/reservations/${reservation.id}`}
																className='flex items-center'>
																<Search className='h-4 w-4 mr-2' />
																View Details
															</Link>
														</DropdownMenuItem>
														<DropdownMenuSeparator />
														{reservation.status === 'PENDING' && (
															<DropdownMenuItem
																className='text-success focus:text-success'
																onClick={() =>
																	handleConfirm(reservation.id)
																}>
																<CheckCircle2 className='h-4 w-4 mr-2' />
																Quick Confirm
															</DropdownMenuItem>
														)}
														{reservation.status !== 'CANCELLED' && (
															<DropdownMenuItem
																className='text-destructive focus:text-destructive'
																onClick={() =>
																	handleCancel(reservation.id)
																}>
																<XCircle className='h-4 w-4 mr-2' />
																Cancel Reservation
															</DropdownMenuItem>
														)}
													</DropdownMenuContent>
												</DropdownMenu>
											</div>
										</div>
										<div className='grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm'>
											<div className='flex items-center gap-2 text-muted-foreground'>
												<Clock className='h-4 w-4' />
												<span>
													{dateStr} {time}
												</span>
											</div>
											<div className='flex items-center gap-2 text-muted-foreground'>
												<Users className='h-4 w-4' />
												<span>{reservation.numberOfGuests} guests</span>
											</div>
											<div className='flex items-center gap-2 text-muted-foreground'>
												<Phone className='h-4 w-4' />
												<span className='truncate'>
													{reservation.customerPhone}
												</span>
											</div>
											<div className='flex items-center gap-2 text-muted-foreground'>
												<Mail className='h-4 w-4' />
												<span className='truncate'>
													{reservation.customerEmail || 'N/A'}
												</span>
											</div>
										</div>
										{reservation.notes && (
											<p className='text-sm text-muted-foreground mt-3 pt-3 border-t border-border italic'>
												Note: {reservation.notes}
											</p>
										)}
									</div>
								);
							})
						)}
					</div>
				</div>
			</div>
		</MainLayout>
	);
}
