import { Clock, RefreshCw, CheckCircle2, XCircle } from "lucide-react";

export const returns = [
  { id: 1, orderId: "BAR-001", table: "Table 5", item: "Mojito", reason: "Wrong drink ordered", status: "pending", time: "5 min ago", resolution: "" },
  { id: 2, orderId: "BAR-008", table: "Bar Seat 2", item: "Old Fashioned", reason: "Too strong", status: "remade", time: "15 min ago", resolution: "Remade with less whiskey" },
  { id: 3, orderId: "BAR-012", table: "Table 7", item: "Margarita", reason: "Wrong glass type", status: "resolved", time: "30 min ago", resolution: "Served in correct glass" },
  { id: 4, orderId: "BAR-015", table: "Table 12", item: "Espresso Martini", reason: "Not enough foam", status: "pending", time: "2 min ago", resolution: "" },
  { id: 5, orderId: "BAR-018", table: "Table 2", item: "House Red Wine", reason: "Cork taint", status: "refunded", time: "1 hour ago", resolution: "Full refund issued" },
];

export const statusStyles = {
  pending: "bg-amber-500/10 text-amber-500",
  remade: "bg-blue-500/10 text-blue-500",
  resolved: "bg-emerald-500/10 text-emerald-500",
  refunded: "bg-purple-500/10 text-purple-500",
};

export const statusIcons = {
  pending: Clock,
  remade: RefreshCw,
  resolved: CheckCircle2,
  refunded: XCircle,
};
