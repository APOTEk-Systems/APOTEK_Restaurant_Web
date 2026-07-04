import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Plus, Search, Edit, Trash2, Loader2, AlertCircle, UserCog } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { staffRoleService, type StaffRole, type CreateStaffRoleData } from "@/services/staffRoleService";
import { departmentService, type Department } from "@/services/departmentService";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SettingsStaffRoles() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<StaffRole | null>(null);
  const [formData, setFormData] = useState<CreateStaffRoleData>({ name: "", description: "", departmentId: undefined });
  const queryClient = useQueryClient();

  // Fetch staff roles
  const { data: roles = [], isLoading, isError, error } = useQuery<StaffRole[]>({
    queryKey: ["staffRoles"],
    queryFn: staffRoleService.getAll,
  });

  // Fetch departments for the dropdown
  const { data: departments = [] } = useQuery<Department[]>({
    queryKey: ["departments"],
    queryFn: departmentService.getAll,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateStaffRoleData) => 
      staffRoleService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staffRoles"] });
      toast.success("Staff role created successfully");
      setIsDialogOpen(false);
      setFormData({ name: "", description: "", departmentId: undefined });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create staff role");
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateStaffRoleData }) =>
      staffRoleService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staffRoles"] });
      toast.success("Staff role updated successfully");
      setIsDialogOpen(false);
      setEditingRole(null);
      setFormData({ name: "", description: "", departmentId: undefined });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update staff role");
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => staffRoleService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staffRoles"] });
      toast.success("Staff role deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete staff role");
    },
  });

  // Filter roles based on search
  const filteredRoles = roles.filter((role) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      role.name?.toLowerCase().includes(searchLower) ||
      role.description?.toLowerCase().includes(searchLower) ||
      role.department?.name?.toLowerCase().includes(searchLower)
    );
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRole) {
      updateMutation.mutate({ id: editingRole.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (role: StaffRole) => {
    setEditingRole(role);
    setFormData({ 
      name: role.name, 
      description: role.description || "", 
      departmentId: role.departmentId || undefined 
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this staff role?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <MainLayout title="Staff Roles" subtitle="Manage staff roles and positions">
      <div className="space-y-6 animate-fade-in">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
            <p className="text-sm text-muted-foreground">Total Roles</p>
            <p className="text-2xl font-bold text-foreground">{isLoading ? "..." : roles.length}</p>
          </div>
          <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
            <p className="text-sm text-muted-foreground">Active Roles</p>
            <p className="text-2xl font-bold text-success">
              {isLoading ? "..." : roles.filter((r) => r.isActive).length}
            </p>
          </div>
          <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
            <p className="text-sm text-muted-foreground">With Department</p>
            <p className="text-2xl font-bold text-muted-foreground">
              {isLoading ? "..." : roles.filter((r) => r.departmentId).length}
            </p>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search roles..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-primary-foreground shadow-glow">
                <Plus className="h-4 w-4 mr-2" />
                Add Role
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingRole ? "Edit Staff Role" : "Add New Staff Role"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Role Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Chef, Bartender, Waiter"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter description (optional)"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select
                    value={formData.departmentId?.toString() || "none"}
                    onValueChange={(value) => setFormData({ ...formData, departmentId: value === "none" ? undefined : parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a department (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Department</SelectItem>
                      {departments.filter(d => d.isActive).map((dept) => (
                        <SelectItem key={dept.id} value={dept.id.toString()}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {createMutation.isPending || updateMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save"
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Error State */}
        {isError && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <p className="text-destructive">Failed to load staff roles: {error instanceof Error ? error.message : "Unknown error"}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Loading staff roles...</span>
          </div>
        ) : (
          /* Roles Table */
          <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRoles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      No staff roles found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRoles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell className="font-medium">#{role.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <UserCog className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{role.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {role.department ? (
                          <Badge variant="outline">{role.department.name}</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground max-w-xs truncate">
                        {role.description || "-"}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={role.isActive ? "default" : "secondary"}>
                          {role.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(role)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(role.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </MainLayout>
  );
}