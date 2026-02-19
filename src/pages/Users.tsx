import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Plus, Search, MoreHorizontal, Mail, Shield, Loader2, Key, Trash2, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/services/userService";
import { userGroupService } from "@/services/userGroupService";
import { permissionService } from "@/services/permissionService";

const roleColors: Record<string, string> = {
  "Admin": "bg-primary/10 text-primary border-primary/20",
  "Manager": "bg-chart-3/10 text-chart-3 border-chart-3/20",
  "Waiter": "bg-success/10 text-success border-success/20",
  "Kitchen": "bg-warning/10 text-warning border-warning/20",
  "Bartender": "bg-chart-5/10 text-chart-5 border-chart-5/20",
};

// Convert permission name to human readable format
function formatPermissionName(name: string): string {
  return name
    .replace(/_/g, ' ')
    .split('.')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

export default function Users() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  
  // Popover state
  const [openPopover, setOpenPopover] = useState<number | null>(null);
  
  // Password dialog state
  const [passwordDialog, setPasswordDialog] = useState<{ open: boolean; userId: number | null }>({ open: false, userId: null });
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Delete dialog state
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; user: any | null }>({ open: false, user: null });
  
  // Permissions dialog state
  const [permissionsDialog, setPermissionsDialog] = useState<{ open: boolean; user: any | null }>({ open: false, user: null });
  const [permissionOverrides, setPermissionOverrides] = useState<{ permissionId: number; allowed: boolean }[]>([]);

  // React Query for data fetching
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getAll(),
  });

  const { data: userGroups = [] } = useQuery({
    queryKey: ['user-groups'],
    queryFn: () => userGroupService.getAll(),
  });

  const { data: allPermissions = [] } = useQuery({
    queryKey: ['permissions'],
    queryFn: () => permissionService.getAll(),
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: ({ userId, password }: { userId: number; password: string }) => 
      userService.changePassword(userId, password),
    onSuccess: () => {
      toast({ title: "Success", description: "Password changed successfully" });
      setPasswordDialog({ open: false, userId: null });
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.response?.data?.message || "Failed to change password",
        variant: "destructive"
      });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: (userId: number) => userService.delete(userId),
    onSuccess: () => {
      toast({ title: "Success", description: "User deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setDeleteDialog({ open: false, user: null });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.response?.data?.message || "Failed to delete user",
        variant: "destructive"
      });
    },
  });

  // Update permissions mutation
  const updatePermissionsMutation = useMutation({
    mutationFn: async ({ userId, overrides }: { userId: number; overrides: { permissionId: number; allowed: boolean }[] }) => {
      // Update each permission override
      for (const override of overrides) {
        await userService.updatePermission(userId, override.permissionId, override.allowed);
      }
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Permissions updated successfully" });
      setPermissionsDialog({ open: false, user: null });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.response?.data?.message || "Failed to update permissions",
        variant: "destructive"
      });
    },
  });

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm || 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === "all" || 
      user.userGroupId?.toString() === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const getRoleName = (userGroupId: number | undefined) => {
    if (!userGroupId) return "No Role";
    const group = userGroups.find(g => g.id === userGroupId);
    return group?.name || "No Role";
  };

  const handlePasswordChange = () => {
    if (!newPassword || newPassword.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
      return;
    }
    if (passwordDialog.userId) {
      changePasswordMutation.mutate({ userId: passwordDialog.userId, password: newPassword });
    }
  };

  const handleDeleteUser = () => {
    if (deleteDialog.user) {
      deleteUserMutation.mutate(deleteDialog.user.id);
    }
  };

  const handleOpenPermissions = (user: any) => {
    // Get existing overrides from user
    const existingOverrides = user.permissionOverrides?.map((o: any) => ({
      permissionId: o.permissionId,
      allowed: o.allowed,
    })) || [];
    setPermissionOverrides(existingOverrides);
    setPermissionsDialog({ open: true, user });
    setOpenPopover(null);
  };

  const handlePermissionToggle = (permissionId: number, checked: boolean) => {
    setPermissionOverrides(prev => {
      const existing = prev.find(p => p.permissionId === permissionId);
      if (existing) {
        return prev.map(p => p.permissionId === permissionId ? { ...p, allowed: checked } : p);
      }
      return [...prev, { permissionId, allowed: checked }];
    });
  };

  const handleSavePermissions = () => {
    if (permissionsDialog.user) {
      updatePermissionsMutation.mutate({ 
        userId: permissionsDialog.user.id, 
        overrides: permissionOverrides 
      });
    }
  };

  // Group permissions by category
  const groupedPermissions = allPermissions.reduce((acc, permission) => {
    const category = permission.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(permission);
    return acc;
  }, {} as Record<string, typeof allPermissions>);

  return (
    <MainLayout title="Users" subtitle="Manage staff members and their roles">
      <div className="space-y-6 animate-fade-in">
    
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="w-full flex gap-3">
            <div className="relative flex-1 ">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search users..." 
                className="pl-9" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {userGroups.map((group) => (
                  <SelectItem key={group.id} value={group.id.toString()}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Users Table */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id} className={!user.isActive && "opacity-60"}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.staff?.firstName ? undefined : undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary font-medium">
                          {user.username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-foreground">{user.username}</div>
                        {user.staff && (
                          <div className="text-sm text-muted-foreground">
                            {user.staff.firstName} {user.staff.lastName}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn("capitalize", roleColors[getRoleName(user.userGroupId)] || "bg-muted/10 text-muted-foreground")}>
                      <Shield className="h-3 w-3 mr-1" />
                      {getRoleName(user.userGroupId)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{user.email || "N/A"}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {!user.isActive && (
                      <Badge variant="secondary" className="text-xs">Inactive</Badge>
                    )}
                    {user.isActive && (
                      <Badge variant="default" className="text-xs bg-success/10 text-success">Active</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Popover open={openPopover === user.id} onOpenChange={(open) => setOpenPopover(open ? user.id : null)}>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-48 p-2" align="end">
                        <div className="flex flex-col gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="justify-start h-9"
                            onClick={() => {
                              handleOpenPermissions(user);
                            }}
                          >
                            <Settings className="h-4 w-4 mr-2" />
                            Permissions
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="justify-start h-9"
                            onClick={() => {
                              setPasswordDialog({ open: true, userId: user.id });
                              setOpenPopover(null);
                            }}
                          >
                            <Key className="h-4 w-4 mr-2" />
                            Change Password
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="justify-start h-9 text-destructive hover:text-destructive"
                            onClick={() => {
                              setDeleteDialog({ open: true, user });
                              setOpenPopover(null);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete User
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Change Password Dialog */}
      <Dialog open={passwordDialog.open} onOpenChange={(open) => setPasswordDialog({ open, userId: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>Enter a new password for this user.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input 
                id="new-password" 
                type="password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input 
                id="confirm-password" 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPasswordDialog({ open: false, userId: null })}>
              Cancel
            </Button>
            <Button 
              onClick={handlePasswordChange}
              disabled={changePasswordMutation.isPending}
            >
              {changePasswordMutation.isPending ? "Saving..." : "Change Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, user: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete user <strong>{deleteDialog.user?.username}</strong>? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false, user: null })}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending ? "Deleting..." : "Delete User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Permissions Dialog */}
      <Dialog open={permissionsDialog.open} onOpenChange={(open) => setPermissionsDialog({ open, user: null })}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Permissions</DialogTitle>
            <DialogDescription>
              Override default permissions for user <strong>{permissionsDialog.user?.username}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {Object.entries(groupedPermissions).map(([category, perms]) => (
              <div key={category} className="space-y-2">
                <h3 className="font-medium text-sm text-muted-foreground capitalize">{category}</h3>
                <div className="grid grid-cols-2 gap-2">
                  {perms.map((permission: any) => {
                    const currentValue = permissionOverrides.find(p => p.permissionId === permission.id);
                    const isChecked = currentValue !== undefined ? currentValue.allowed : false;
                    
                    return (
                      <div 
                        key={permission.id} 
                        className="flex items-center gap-2 p-2 rounded border border-border/50"
                      >
                        <Checkbox 
                          id={`perm-${permission.id}`}
                          checked={isChecked}
                          onCheckedChange={(checked) => handlePermissionToggle(permission.id, checked as boolean)}
                        />
                        <Label 
                          htmlFor={`perm-${permission.id}`}
                          className="text-sm cursor-pointer"
                        >
                          {formatPermissionName(permission.name)}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPermissionsDialog({ open: false, user: null })}>
              Cancel
            </Button>
            <Button 
              onClick={handleSavePermissions}
              disabled={updatePermissionsMutation.isPending}
            >
              {updatePermissionsMutation.isPending ? "Saving..." : "Save Permissions"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
