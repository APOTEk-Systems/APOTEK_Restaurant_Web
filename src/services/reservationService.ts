import { api } from './api';

export interface Reservation {
  id: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  date: string;
  numberOfGuests: number;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  tables: {
    id: number;
    tableId: number;
    table: {
      id: number;
      number: number;
      capacity: number;
      status: string;
    };
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
  getReservations: async (params?: {
    startDate?: string;
    endDate?: string;
    status?: string;
    search?: string;
  }): Promise<Reservation[]> => {
    const response = await api.get('/reservations', { params });
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
    const response = await api.patch(`/reservations/${id}/cancel`);
    return response.data;
  },
};