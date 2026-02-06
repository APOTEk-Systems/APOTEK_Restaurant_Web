import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MenuService, type MenuSideDish } from "@/services/menuService";
import { useToast } from "@/hooks/use-toast";

interface SideDishDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sideDish?: MenuSideDish | null;
}

export function SideDishDialog({ open, onOpenChange, sideDish = null }: SideDishDialogProps) {
  const isEditing = !!sideDish;
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    if (sideDish) {
      setName(sideDish.name);
      setDescription(sideDish.description || "");
      setPrice(sideDish.price.toString());
    } else {
      resetForm();
    }
  }, [sideDish, open]);

  const resetForm = () => {
    setName("");
    setDescription("");
    setPrice("");
  };

  const createMutation = useMutation({
    mutationFn: (data: { name: string; description: string | null; price: number; isAvailable: boolean }) =>
      MenuService.createMenuSideDish(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuSideDishes'] });
      toast({ title: "Success", description: "Side dish created successfully" });
      onOpenChange(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to create side dish", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { name: string; description: string | null; price: number }) =>
      MenuService.updateMenuSideDish(sideDish!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuSideDishes'] });
      toast({ title: "Success", description: "Side dish updated successfully" });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to update side dish", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) {
      toast({ title: "Error", description: "Name and price are required", variant: "destructive" });
      return;
    }
    const data = {
      name,
      description: description || null,
      price: parseFloat(price),
    };
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate({ ...data, isAvailable: true });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Side Dish" : "Add New Side Dish"}</DialogTitle>
            <DialogDescription>
              {isEditing ? "Update the side dish details below." : "Create a new side dish for menu items. Fill in the details below."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., French Fries"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Crispy golden fries"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {createMutation.isPending || updateMutation.isPending
                ? "Saving..."
                : isEditing
                ? "Save Changes"
                : "Create Side Dish"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}