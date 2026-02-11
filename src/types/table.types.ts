export interface Table {
	id: number;
	tableNumber: number;
	capacity: number;
	status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'MAINTENANCE';
	location?: string;
}

export interface AvailableTable extends Table {
	nextReservationTime?: string;
}
