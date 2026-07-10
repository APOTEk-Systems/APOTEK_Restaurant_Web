import { api } from './api';

export interface StaffMember {
  id: number;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  status?: string;
}

export const StaffService = {
  getWaiters: async (): Promise<StaffMember[]> => {
    const response = await api.get('/staff/waiters');
    return response.data;
  },
};
