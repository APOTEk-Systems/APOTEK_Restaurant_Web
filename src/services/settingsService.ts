import { api } from './api';

export interface RestaurantSettings {
  restaurant_name?: string;
  registration_number?: string;
  tin_number?: string;
  vrn_number?: string;
  phone_number?: string;
  email_address?: string;
  website?: string;
  logo?: string;
}

// Generic settings type for any key-value pairs
export type GenericSettings = Record<string, string | null | undefined>;

export const settingsService = {
  getAllSettings: async (): Promise<GenericSettings> => {
    const response = await api.get('/settings');
    return response.data;
  },

  updateSettings: async (data: GenericSettings): Promise<void> => {
    await api.put('/settings', data);
  },

  // Individual setting operations
  getSetting: async (key: string): Promise<{ key: string; value: string | null }> => {
    const response = await api.get(`/settings/${key}`);
    return response.data;
  },

  updateSetting: async (key: string, value: string): Promise<void> => {
    await api.put(`/settings/${key}`, { value });
  },
};