import { api } from './api';

export type SettingsMap = Record<string, string | null>;

export const SettingsService = {
  getAllSettings: async (): Promise<SettingsMap> => {
    const response = await api.get('/settings');
    return response.data;
  },
};
