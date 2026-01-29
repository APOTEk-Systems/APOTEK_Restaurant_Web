import { api } from '@/services/api';
import { BarReturn, BarReturnStatus } from '@/types/barReturn';

const BAR_RETURNS_API_BASE_URL = '/bar-returns';

interface CreateBarReturnDto {
  orderId: string;
  table: string;
  item: string;
  reason: string;
}

interface UpdateBarReturnStatusDto {
  status: BarReturnStatus;
  resolution?: string;
}

export const barReturnsService = {
  /**
   * Fetches all bar returns from the API.
   * @returns A promise that resolves to an array of BarReturn objects.
   */
  getBarReturns: async (): Promise<BarReturn[]> => {
    try {
      const response = await api.get<BarReturn[]>(BAR_RETURNS_API_BASE_URL);
      return response.data;
    } catch (error) {
      console.error('Error fetching bar returns:', error);
      throw error;
    }
  },

  /**
   * Updates the status and optionally the resolution of a specific bar return.
   * @param id The ID of the bar return to update.
   * @param data An object containing the new status and optional resolution.
   * @returns A promise that resolves to the updated BarReturn object.
   */
  updateBarReturnStatus: async (
    id: number,
    data: UpdateBarReturnStatusDto,
  ): Promise<BarReturn> => {
    try {
      const response = await api.patch<BarReturn>(`${BAR_RETURNS_API_BASE_URL}/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating bar return ${id} status:`, error);
      throw error;
    }
  },

  /**
   * Creates a new bar return entry.
   * @param newReturnData An object containing the data for the new bar return.
   * @returns A promise that resolves to the newly created BarReturn object.
   */
  createBarReturn: async (newReturnData: CreateBarReturnDto): Promise<BarReturn> => {
    try {
      const response = await api.post<BarReturn>(BAR_RETURNS_API_BASE_URL, newReturnData);
      return response.data;
    } catch (error) {
      console.error('Error creating bar return:', error);
      throw error;
    }
  },
};
