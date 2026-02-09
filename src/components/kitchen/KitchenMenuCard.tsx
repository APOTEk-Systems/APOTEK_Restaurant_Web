import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Star, ToggleLeft, ToggleRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MenuService } from "@/services/menuService";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface KitchenMenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  isAvailable: boolean;
  rating?: number;
  categoryName?: string;
  orders?: number;
}

interface KitchenMenuCardProps {
  item: any;
  onEdit: (item: any) => void;
  onDelete: (id: number) => void;
}

export function KitchenMenuCard({
  item,
  onEdit,
  onDelete,
}: KitchenMenuCardProps) {
  const [isToggling, setIsToggling] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const toggleAvailabilityMutation = useMutation({
    mutationFn: ({ id, isAvailable }: { id: number; isAvailable: boolean }) =>
      MenuService.toggleMenuItemAvailability(id, !isAvailable),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      toast({
        title: "Success",
        description: "Menu item availability updated",
      });
      setIsToggling(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update availability",
        variant: "destructive",
      });
      setIsToggling(false);
    },
  });

  const handleToggleAvailability = () => {
    setIsToggling(true);
    toggleAvailabilityMutation.mutate({ id: item.id, isAvailable: item.isAvailable });
  };
  return (
    <div
      className={cn(
        "bg-card rounded-xl p-5 shadow-card border border-border/50 hover:shadow-card-hover transition-all duration-300 hover-lift",
        !item.isAvailable && "opacity-60"
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">{item.name}</h3>
            {!item.isAvailable && (
              <Badge variant="secondary" className="text-xs">
                Unavailable
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {item.description}
          </p>
          {item.categoryName && (
            <Badge variant="outline" className="mt-2 text-xs">
              {item.categoryName}
            </Badge>
          )}
        </div>
        <span className="text-lg font-bold text-primary">
          ${item.price.toLocaleString("en-US")}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {item.rating && (
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 text-warning fill-warning" />
              {item.rating}
            </span>
          )}
          {item.orders && <span>{item.orders} orders</span>}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onEdit(item)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Menu Item</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{item.name}"? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(item.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleToggleAvailability()}
            disabled={isToggling}
          >
            {isToggling ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : item.isAvailable ? (
              <ToggleRight className="h-4 w-4 text-success" />
            ) : (
              <ToggleLeft className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
