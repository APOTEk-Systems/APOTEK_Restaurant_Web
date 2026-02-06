import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adjustmentReasonService, type AdjustmentReason } from "@/services/adjustmentReasonService";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const typeStyles = {
  increase: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  decrease: "bg-red-500/10 text-red-500 border-red-500/20",
  both: "bg-primary/10 text-primary border-primary/20",
};

const typeLabels = {
  increase: "Increase",
  decrease: "Decrease",
  both: "Increase/Decrease",
};

export default function SettingsAdjustmentReasons() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReason, setEditingReason] = useState<AdjustmentReason | null>(null);
  const [deleteReasonId, setDeleteReasonId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "decrease" as "increase" | "decrease" | "both",
    description: "",
  });

  const queryClient = useQueryClient();

  // Fetch adjustment reasons
  const { data: reasons = [], isLoading } = useQuery({
    queryKey: ["adjustmentReasons"],
    queryFn: adjustmentReasonService.getAllAdjustmentReasons,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => adjustmentReasonService.createAdjustmentReason(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adjustmentReasons"] });
      toast.success("Adjustment reason created successfully");
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create adjustment reason");
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<typeof formData> }) =>
      adjustmentReasonService.updateAdjustmentReason(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adjustmentReasons"] });
      toast.success("Adjustment reason updated successfully");
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update adjustment reason");
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => adjustmentReasonService.deleteAdjustmentReason(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adjustmentReasons"] });
      toast.success("Adjustment reason deleted successfully");
      setDeleteReasonId(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete adjustment reason");
    },
  });

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingReason(null);
    setFormData({ name: "", type: "decrease", description: "" });
  };

  const handleOpenDialog = (reason?: AdjustmentReason) => {
    if (reason) {
      setEditingReason(reason);
      setFormData({
        name: reason.name,
        type: reason.type,
        description: reason.description || "",
      });
    } else {
      setEditingReason(null);
      setFormData({ name: "", type: "decrease", description: "" });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingReason) {
      updateMutation.mutate({ id: editingReason.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <MainLayout
      title="Adjustment Reasons"
      subtitle="Manage reasons for inventory adjustments"
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-muted-foreground">
              Define reasons that can be selected when making inventory adjustments.
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Reason
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingReason ? "Edit" : "Add"} Adjustment Reason</DialogTitle>
                <DialogDescription>
                  {editingReason
                    ? "Update the adjustment reason details below."
                    : "Create a new reason for inventory adjustments."}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Reason Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Damaged Goods"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: "increase" | "decrease" | "both") =>
                        setFormData({ ...formData, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="increase">Increase</SelectItem>
                        <SelectItem value="decrease">Decrease</SelectItem>
                        <SelectItem value="both">Increase/Decrease</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe when to use this reason"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={handleCloseDialog}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {(createMutation.isPending || updateMutation.isPending) && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    {editingReason ? "Update" : "Create"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Adjustment Reasons</CardTitle>
            <CardDescription>List of available adjustment reasons for inventory management</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-3 text-muted-foreground">Loading adjustment reasons...</span>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reason Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reasons.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                        No adjustment reasons found. Create one to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    reasons.map((reason: AdjustmentReason) => (
                      <TableRow key={reason.id}>
                        <TableCell className="font-medium">{reason.name}</TableCell>
                        <TableCell>
                          <Badge className={typeStyles[reason.type]}>
                            {typeLabels[reason.type]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {reason.description || "-"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={reason.isActive ? "outline" : "secondary"}>
                            {reason.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenDialog(reason)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <AlertDialog
                              open={deleteReasonId === reason.id}
                              onOpenChange={(open) => setDeleteReasonId(open ? reason.id : null)}
                            >
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setDeleteReasonId(reason.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Adjustment Reason</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{reason.name}"? This action cannot be
                                    undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteMutation.mutate(reason.id)}
                                    disabled={deleteMutation.isPending}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    {deleteMutation.isPending && (
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    )}
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
