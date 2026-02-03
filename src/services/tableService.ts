import { api } from './api';

export interface Table {
  id: number;
  number: number;
  capacity: number;
  status: string;
  reservationDue?: string | null;
}

export interface Reservation {
  id: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  date: string;
  numberOfGuests: number;
  status: string;
  notes?: string;
  tables: Array<{
    reservationId: number;
    tableId: number;
    table: Table;
  }>;
}

export const TableService = {
  // Get all tables
  getAllTables: async (): Promise<Table[]> => {
    const response = await api.get('/tables');
    return response.data;
  },

  // Get only available tables with reservationDue info
  getAvailableTables: async (date?: string | undefined): Promise<Table[]> => {
    const url = date ? `/tables/available?date=${date}` : '/tables/available';
    const response = await api.get(url);
    return response.data;
  },

  // Get tables booked for today with reservation times
  getBookedTables: async (): Promise<Table[]> => {
    const response = await api.get('/reservations/tables');
    return response.data;
  },

  // Get today's reservations
  getTodayReservations: async (): Promise<Reservation[]> => {
    const response = await api.get('/reservations/today');
    return response.data;
  },

  // Get reservations by date range
  getReservationsByDateRange: async (startDate: string, endDate: string): Promise<Reservation[]> => {
    const response = await api.get(`/reservations/by-date-range?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  },

  // Create a reservation
  createReservation: async (data: {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    date: string;
    numberOfGuests: number;
    tableIds: number[];
    notes?: string;
    status?: string;
  }): Promise<Reservation> => {
    const response = await api.post('/reservations', data);
    return response.data;
  },

  // Update reservation status
  updateReservationStatus: async (id: number, status: string): Promise<Reservation> => {
    const response = await api.patch(`/reservations/${id}`, { status });
    return response.data;
  },

  // Create a table
  createTable: async (data: {
    number: number;
    capacity: number;
    status?: string;
  }): Promise<Table> => {
    const response = await api.post('/tables', data);
    return response.data;
  },

  // Update table status
  updateTable: async (id: number, data: Partial<Table>): Promise<Table> => {
    const response = await api.patch(`/tables/${id}`, data);
    return response.data;
  },

  // Delete table
  deleteTable: async (id: number): Promise<void> => {
    await api.delete(`/tables/${id}`);
  },
};