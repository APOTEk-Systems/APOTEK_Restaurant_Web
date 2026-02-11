// Table nested in reservation response
export interface ReservationTable {
	reservationId: string;
	tableId: number;
	table: {
		id: number;
		number: number;
		capacity: number;
		status: string;
		createdAt: string;
		updatedAt: string;
	};
}

export interface Reservation {
	id: string;
	customerName: string;
	customerEmail: string | null;
	customerPhone: string;
	date: string;
	numberOfGuests: number;
	status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
	notes: string | null;
	createdAt: string;
	updatedAt: string;
	tables?: ReservationTable[];
}

export interface CreateReservationDto {
	customerName: string;
	customerPhone: string;
	customerEmail: string;
	date: string;
	numberOfGuests: number;
	tableIds: number[];
	notes?: string;
	status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
}

export interface UpdateReservationDto {
	customerName?: string;
	customerPhone?: string;
	customerEmail?: string;
	date?: string;
	numberOfGuests?: number;
	tableIds?: number[];
	status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
	notes?: string;
}

export interface ReservationSummary {
	totalReservations: number;
	totalGuests: number;
	tablesReserved: number;
	totalTables: number;
}
