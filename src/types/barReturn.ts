export enum BarReturnStatus {
  PENDING = "pending",
  REMADE = "remade",
  RESOLVED = "resolved",
  REFUNDED = "refunded",
}

export interface BarReturn {
  id: number;
  orderId: string;
  table: string;
  item: string;
  reason: string;
  status: BarReturnStatus;
  time: string; // Consider using Date or a more specific date/time type if actual dates are used
  resolution: string;
}
