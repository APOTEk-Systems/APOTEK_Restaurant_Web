export interface AdjustmentReason {
  id: number;
  name: string;
  type: 'increase' | 'decrease' | 'both';
  description?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAdjustmentReasonDto {
  name: string;
  type: 'increase' | 'decrease' | 'both';
  description?: string;
  active?: boolean;
}

export interface UpdateAdjustmentReasonDto {
  name?: string;
  type?: 'increase' | 'decrease' | 'both';
  description?: string;
  active?: boolean;
}
