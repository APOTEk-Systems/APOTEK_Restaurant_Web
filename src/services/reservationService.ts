import { api } from './api';

interface Reservation {
  id: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  date: string;
OfGuests: number;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  tables: {
    id: number;
    number: number;
    capacity: number;
  }[];
}

interface CreateReservationData {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  date: string; // ISO 8601 string
  numberOfGuests: number;
  status?: string;
  notes?: string;
  tableIds: number[];
}

interface UpdateReservationData {
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  date?: string;
  time?: string;
  numberOfGuests?: number;
  status?: string;
  notes?: string;
  tableIds?: number[];
}

export const ReservationService = {
  getAllReservations: async (): Promise<Reservation[]> => {
    const response = await api.get('/reservations');
    return response.data;
  },

  getTodayReservations: async (): Promise<Reservation[]> => {
    const response = await api.get('/reservations/today');
    return response.data;
  },

  getReservationsByDateRange: async (startDate: string, endDate: string): Promise<Reservation[]> => {
    const response = await api.get('/reservations/by-date-range', {
      params: { startDate, endDate },
    });
    return response.data;
  },

  getBookedTables: async (): Promise<{ id: number; number: number; capacity: number; reservationTime: string }[]> => {
    const response = await api.get('/reservations/tables');
    return response.data;
  },

  getReservationById: async (id: number): Promise<Reservation> => {
    const response = await api.get(`/reservations/${id}`);
    return response.data;
  },

  createReservation: async (data: CreateReservationData): Promise<Reservation> => {
    const response = await api.post('/reservations', data);
    return response.data;
  },

  updateReservation: async (id: number, data: UpdateReservationData): Promise<Reservation> => {
    const response = await api.patch(`/reservations/${id}`, data);
    return response.data;
  },

  deleteReservation: async (id: number): Promise<void> => {
    await api.delete(`/reservations/${id}`);
  },

  confirmReservation: async (id: number): Promise<Reservation> => {
    const response = await api.patch(`/reservations/${id}`, { status: 'CONFIRMED' });
    return response.data;
  },

  cancelReservation: async (id: number): Promise<Reservation> => {
    const response = await api.patch(`/reservations/${id}`, { status: 'CANCELLED' });
    return response.data;
  },
};