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
import { MenuService, type MenuAddon } from "@/services/menuService";
import { useToast } from "@/hooks/use-toast";

interface AddonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  addon?: MenuAddon | null;
}

export function AddonDialog({ open, onOpenChange, addon = null }: AddonDialogProps) {
  const isEditing = !!addon;
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    if (addon) {
      setName(addon.name);
      setDescription(addon.description || "");
      setPrice(addon.price.toString());
    } else {
      resetForm();
    }
  }, [addon, open]);

  const resetForm = () => {
    setName("");
    setDescription("");
    setPrice("");
  };

  const createMutation = useMutation({
    mutationFn: (data: { name: string; description: string | null; price: number; isAvailable: boolean }) =>
      MenuService.createMenuAddon(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuAddons'] });
      toast({ title: "Success", description: "Addon created successfully" });
      onOpenChange(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to create addon", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { name: string; description: string | null; price: number }) =>
      MenuService.updateMenuAddon(addon!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuAddons'] });
      toast({ title: "Success", description: "Addon updated successfully" });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to update addon", variant: "destructive" });
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
            <DialogTitle>{isEditing ? "Edit Addon" : "Add New Addon"}</DialogTitle>
            <DialogDescription>
              {isEditing ? "Update the addon details below." : "Create a new addon for menu items. Fill in the details below."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Extra Cheese"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Additional cheese topping"
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
                : "Create Addon"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}