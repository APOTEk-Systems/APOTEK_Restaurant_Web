import { api } from './api';
import type {
	Reservation,
	CreateReservationDto,
	UpdateReservationDto,
	ReservationSummary,
} from '../types/reservation.types';

const getErrorMessage = (error: unknown, defaultMessage: string): string => {
	if (!error) return defaultMessage;
	const err = error as Record<string, unknown>;
	const response = err?.response as Record<string, unknown>;
	if (!response) return defaultMessage;
	const data = response?.data as Record<string, unknown>;
	if (!data) return defaultMessage;

	const errors = data?.errors as Array<Record<string, string>>;
	if (Array.isArray(errors) && errors.length > 0) {
		const errorMessages = errors
			.map((e) => e?.message || e?.field || JSON.stringify(e))
			.join(', ');
		return `${data?.message || 'Validation error'}: ${errorMessages}`;
	}

	return String(data?.message || data?.error || defaultMessage);
};

// Helper to calculate summary from reservations
const calculateSummary = (reservations: Reservation[]): ReservationSummary => {
	// Count tables used from the nested structure
	const tablesUsed = reservations.reduce((acc, r) => {
		if (r.tables && r.tables.length > 0) {
			return acc + r.tables.length;
		}
		return acc + 1;
	}, 0);

	return {
		totalReservations: reservations.length,
		totalGuests: reservations.reduce((acc, r) => acc + r.numberOfGuests, 0),
		tablesReserved: tablesUsed,
		totalTables: 24,
	};
};

export const ReservationService = {
	// Get all reservations
	getAllReservations: async (): Promise<Reservation[]> => {
		const response = await api.get('/reservations');
		return response.data;
	},

	// Get reservation by ID
	getReservationById: async (id: string): Promise<Reservation> => {
		const response = await api.get(`/reservations/${id}`);
		return response.data;
	},

	// Get all reservations with summary
	getAllReservationsWithSummary: async (): Promise<{
		reservations: Reservation[];
		summary: ReservationSummary;
	}> => {
		const response = await api.get('/reservations');
		const allReservations: Reservation[] = response.data;
		const summary = calculateSummary(allReservations);

		return {
			reservations: allReservations,
			summary,
		};
	},

	// Create new reservation
	createReservation: async (
		reservationData: CreateReservationDto,
	): Promise<Reservation> => {
		try {
			const response = await api.post('/reservations', reservationData);
			return response.data;
		} catch (error) {
			throw new Error(getErrorMessage(error, 'Failed to create reservation'));
		}
	},

	// Update reservation (includes status update)
	updateReservation: async (
		id: string,
		reservationData: UpdateReservationDto,
	): Promise<Reservation> => {
		try {
			const response = await api.patch(`/reservations/${id}`, reservationData);
			return response.data;
		} catch (error) {
			throw new Error(getErrorMessage(error, 'Failed to update reservation'));
		}
	},

	// Confirm reservation (PATCH to update status to CONFIRMED)
	confirmReservation: async (id: string): Promise<Reservation> => {
		try {
			const response = await api.patch(`/reservations/${id}`, {
				status: 'CONFIRMED',
			});
			return response.data;
		} catch (error) {
			throw new Error(getErrorMessage(error, 'Failed to confirm reservation'));
		}
	},

	// Cancel reservation (PATCH to update status to CANCELLED - not delete)
	// This keeps the reservation in the database so it can still be filtered
	cancelReservation: async (id: string): Promise<Reservation> => {
		try {
			const response = await api.patch(`/reservations/${id}`, {
				status: 'CANCELLED',
			});
			return response.data;
		} catch (error) {
			throw new Error(getErrorMessage(error, 'Failed to cancel reservation'));
		}
	},

	// Delete reservation (permanent deletion)
	deleteReservation: async (id: string): Promise<void> => {
		try {
			await api.delete(`/reservations/${id}`);
		} catch (error) {
			throw new Error(getErrorMessage(error, 'Failed to delete reservation'));
		}
	},
};
