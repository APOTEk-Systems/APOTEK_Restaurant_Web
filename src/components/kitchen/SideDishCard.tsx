import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, ToggleLeft, ToggleRight, Loader2 } from "lucide-react";
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

interface MenuSideDish {
  id: number;
  name: string;
  description: string;
  price: number;
  isAvailable: boolean;
}

interface SideDishCardProps {
  sideDish: any;
  onEdit: (sideDish: any) => void;
  onDelete: (id: number) => void;
}

export function SideDishCard({
  sideDish,
  onEdit,
  onDelete,
}: SideDishCardProps) {
  const [isToggling, setIsToggling] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const toggleAvailabilityMutation = useMutation({
    mutationFn: ({ id, isAvailable }: { id: number; isAvailable: boolean }) =>
      MenuService.toggleSideDishAvailability(id, !isAvailable),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuSideDishes'] });
      toast({
        title: "Success",
        description: "Side dish availability updated",
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
    toggleAvailabilityMutation.mutate({ id: sideDish.id, isAvailable: sideDish.isAvailable });
  };
  return (
    <div
      className={cn(
        "bg-card rounded-xl p-5 shadow-card border border-border/50 hover:shadow-card-hover transition-all duration-300 hover-lift",
        !sideDish.isAvailable && "opacity-60"
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">{sideDish.name}</h3>
            {!sideDish.isAvailable && (
              <Badge variant="secondary" className="text-xs">
                Unavailable
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {sideDish.description}
          </p>
        </div>
        <span className="text-lg font-bold text-primary">
          ${sideDish.price.toLocaleString("en-US")}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {sideDish.isAvailable && (
            <Badge variant="outline" className="text-xs">
              Available as side
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onEdit(sideDish)}
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
                <AlertDialogTitle>Delete Side Dish</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{sideDish.name}"? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(sideDish.id)}
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
            ) : sideDish.isAvailable ? (
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
