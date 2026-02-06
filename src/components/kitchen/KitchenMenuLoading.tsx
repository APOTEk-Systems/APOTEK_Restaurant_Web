import { Loader2 } from "lucide-react";

interface KitchenMenuLoadingProps {
  message?: string;
}

export function KitchenMenuLoading({ message = "Loading kitchen management..." }: KitchenMenuLoadingProps) {
  return (
    <div className="flex justify-center items-center py-12">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <span className="ml-4 text-lg">{message}</span>
    </div>
  );
}