import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
	ArrowLeft,
	Users,
	Clock,
	Phone,
	Mail,
	Calendar,
	XCircle,
} from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ReservationService } from '@/services/reservationService';
import type { Reservation } from '@/types/reservation.types';
import { toast } from '@/hooks/use-toast';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

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
const getTableNames = (
	tables?: Array<{
		table: { number: number };
	}>,
): string[] => {
	if (!tables || tables.length === 0) {
		return [];
	}
	return tables.map((t) => `Table ${t.table.number}`);
};

export default function ReservationView() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const [reservation, setReservation] = useState<Reservation | null>(null);
	const [loading, setLoading] = useState(true);
	const [actionLoading, setActionLoading] = useState<string | null>(null);

	useEffect(() => {
		const fetchReservation = async () => {
			if (!id) return;
			try {
				setLoading(true);
				const data = await ReservationService.getReservationById(id);
				setReservation(data);
			} catch (error) {
				toast({
					title: 'Error',
					description: 'Failed to load reservation details',
					variant: 'destructive',
				});
				navigate('/reservations');
			} finally {
				setLoading(false);
			}
		};

		fetchReservation();
	}, [id, navigate]);

	const handleCancelReservation = async () => {
		if (!id) return;
		setActionLoading('cancel');
		try {
			await ReservationService.cancelReservation(id);
			toast({
				title: 'Reservation Cancelled',
				description: 'The reservation has been cancelled successfully',
				variant: 'default',
			});
			const updatedData = await ReservationService.getReservationById(id);
			setReservation(updatedData);
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

	if (loading) {
		return (
			<MainLayout
				title='Reservation Details'
				subtitle='View reservation information'>
				<div className='flex items-center justify-center h-64'>
					<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary' />
				</div>
			</MainLayout>
		);
	}

	if (!reservation) {
		return (
			<MainLayout
				title='Reservation Not Found'
				subtitle='The requested reservation was not found'>
				<div className='flex justify-center'>
					<Link to='/reservations'>
						<Button
							variant='outline'
							className='gap-2'>
							<ArrowLeft className='h-4 w-4' />
							Back to Reservations
						</Button>
					</Link>
				</div>
			</MainLayout>
		);
	}

	const { date: dateStr, time } = formatReservationDateTime(reservation.date);
	const tableNames = getTableNames(reservation.tables);

	return (
		<MainLayout
			title='Reservation Details'
			subtitle='View reservation information'>
			<div className='space-y-6 animate-fade-in'>
				{/* Back Button */}
				<Link to='/reservations'>
					<Button
						variant='ghost'
						className='gap-2'>
						<ArrowLeft className='h-4 w-4' />
						Back to Reservations
					</Button>
				</Link>

				{/* Reservation Details Card */}
				<Card className='shadow-card border-border/50'>
					<CardHeader className='border-b border-border'>
						<div className='flex items-start justify-between'>
							<div className='flex items-center gap-4'>
								<div className='h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center'>
									<Users className='h-6 w-6 text-primary' />
								</div>
								<div>
									<CardTitle className='text-xl'>
										{reservation.customerName}
									</CardTitle>
									<p className='text-sm text-muted-foreground'>
										Reservation ID: {reservation.id}
									</p>
								</div>
							</div>
							<Badge
								className={`capitalize ${
									statusStyles[reservation.status] || statusStyles.COMPLETED
								}`}>
								{reservation.status.toLowerCase()}
							</Badge>
						</div>
					</CardHeader>
					<CardContent className='space-y-6 pt-6'>
						{/* Contact Information */}
						<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
							<div className='space-y-4'>
								<h3 className='font-semibold text-foreground'>
									Contact Information
								</h3>
								<div className='space-y-3'>
									<div className='flex items-center gap-3'>
										<Phone className='h-4 w-4 text-muted-foreground' />
										<span>{reservation.customerPhone}</span>
									</div>
									<div className='flex items-center gap-3'>
										<Mail className='h-4 w-4 text-muted-foreground' />
										<span>{reservation.customerEmail || 'N/A'}</span>
									</div>
								</div>
							</div>

							{/* Reservation Details */}
							<div className='space-y-4'>
								<h3 className='font-semibold text-foreground'>
									Reservation Details
								</h3>
								<div className='space-y-3'>
									<div className='flex items-center gap-3'>
										<Calendar className='h-4 w-4 text-muted-foreground' />
										<span>{dateStr}</span>
									</div>
									<div className='flex items-center gap-3'>
										<Clock className='h-4 w-4 text-muted-foreground' />
										<span>{time}</span>
									</div>
									<div className='flex items-center gap-3'>
										<Users className='h-4 w-4 text-muted-foreground' />
										<span>{reservation.numberOfGuests} guests</span>
									</div>
								</div>
							</div>
						</div>

						{/* Table Assignment */}
						<div className='space-y-4'>
							<h3 className='font-semibold text-foreground'>
								Table Assignment
							</h3>
							{tableNames.length > 0 ? (
								<div className='flex flex-wrap gap-2'>
									{tableNames.map((tableName) => (
										<Badge
											key={tableName}
											variant='outline'
											className='text-sm'>
											{tableName}
										</Badge>
									))}
								</div>
							) : (
								<p className='text-muted-foreground'>No table assigned</p>
							)}
						</div>

						{/* Notes */}
						{reservation.notes && (
							<div className='space-y-4'>
								<h3 className='font-semibold text-foreground'>Notes</h3>
								<p className='text-muted-foreground italic'>
									{reservation.notes}
								</p>
							</div>
						)}

						{/* Timestamps */}
						<div className='pt-4 border-t border-border text-sm text-muted-foreground'>
							<p>Created: {new Date(reservation.createdAt).toLocaleString()}</p>
							{reservation.updatedAt && (
								<p>
									Last Updated:{' '}
									{new Date(reservation.updatedAt).toLocaleString()}
								</p>
							)}
						</div>

						{/* Actions */}
						<div className='flex justify-end gap-3 pt-4 border-t border-border'>
							{/* Cancel Reservation Button */}
							{reservation.status === 'PENDING' && (
								<AlertDialog>
									<AlertDialogTrigger asChild>
										<Button
											variant='outline'
											className='gap-2 text-warning border-warning hover:bg-warning/10'>
											<XCircle className='h-4 w-4' />
											Cancel Reservation
										</Button>
									</AlertDialogTrigger>
									<AlertDialogContent>
										<AlertDialogHeader>
											<AlertDialogTitle>Cancel Reservation?</AlertDialogTitle>
											<AlertDialogDescription>
												This will mark the reservation as cancelled. The record
												will be kept for reference and can still be viewed in
												the cancelled filter.
											</AlertDialogDescription>
										</AlertDialogHeader>
										<AlertDialogFooter>
											<AlertDialogCancel>Keep Reservation</AlertDialogCancel>
											<AlertDialogAction
												onClick={handleCancelReservation}
												disabled={actionLoading === 'cancel'}>
												{actionLoading === 'cancel'
													? 'Cancelling...'
													: 'Cancel Reservation'}
											</AlertDialogAction>
										</AlertDialogFooter>
									</AlertDialogContent>
								</AlertDialog>
							)}

							{/* Status Message for Non-Pending */}
							{reservation.status !== 'PENDING' && (
								<div className='flex items-center gap-2 text-muted-foreground text-sm'>
									{reservation.status === 'CANCELLED' ? (
										<>
											<XCircle className='h-4 w-4 text-destructive' />
											<span>This reservation has been cancelled</span>
										</>
									) : reservation.status === 'CONFIRMED' ? (
										<>
											<span className='text-success'>
												Reservation confirmed
											</span>
										</>
									) : null}
								</div>
							)}
						</div>
					</CardContent>
				</Card>
			</div>
		</MainLayout>
	);
}
