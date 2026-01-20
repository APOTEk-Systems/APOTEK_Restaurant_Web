import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, UtensilsCrossed } from "lucide-react";

interface AddSideDishDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSideDish: (newSideDish: {
    name: string;
    description?: string;
    price: number;
    isAvailable: boolean;
  }) => void;
}

export const AddSideDishDialog: React.FC<AddSideDishDialogProps> = ({
  isOpen,
  onClose,
  onAddSideDish,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [isAvailable, setIsAvailable] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddSideDish({ name, description, price, isAvailable });
    // Reset form fields
    setName("");
    setDescription("");
    setPrice(0);
    setIsAvailable(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" /> Add New Side Dish
          </DialogTitle>
          <DialogDescription>
            Enter the details for the new menu side dish. Click save when you're
            done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="side-name">Name *</Label>
              <Input
                id="side-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="side-description">Description</Label>
              <Textarea
                id="side-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="side-price">Price *</Label>
              <Input
                id="side-price"
                type="number"
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value))}
                min="0"
                step="0.01"
                required
              />
            </div>
            <div className="flex items-center justify-between space-x-2 p-2">
              <Label htmlFor="side-available">Available</Label>
              <Switch
                id="side-available"
                checked={isAvailable}
                onCheckedChange={setIsAvailable}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">
              <UtensilsCrossed className="h-4 w-4 mr-2" /> Save Side Dish
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
