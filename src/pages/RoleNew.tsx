import { useState, useMemo, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Save, Shield, Settings, Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { permissionService } from "@/services/permissionService";
import { userGroupService } from "@/services/userGroupService";
import { useToast } from "@/hooks/use-toast";

// Convert permission name to human readable format
function formatPermissionName(name: string): string {
  return name
    .replace(/_/g, ' ')
    .split('.')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

export default function RoleNew() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [roleName, setRoleName] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [isDefault, setIsDefault] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // Fetch permissions from database
  const { data: permissions = [], isLoading: loadingPermissions } = useQuery({
    queryKey: ['permissions'],
    queryFn: () => permissionService.getAll(),
  });

  // Fetch existing role if in edit mode
  const { data: existingRole, isLoading: loadingRole } = useQuery({
    queryKey: ['user-group', id],
    queryFn: () => userGroupService.getById(Number(id)),
    enabled: isEditMode && Boolean(id),
  });

  // Populate form when editing
  useEffect(() => {
    if (existingRole) {
      setRoleName(existingRole.name);
      setRoleDescription(existingRole.description || "");
      setIsDefault(existingRole.isDefault);
      setIsActive(existingRole.isActive);
      setSelectedPermissions(existingRole.permissions?.map(p => p.permissionId) || []);
    }
  }, [existingRole]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: { name: string; description?: string; permissionIds: number[]; isDefault: boolean }) =>
      userGroupService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-groups'] });
      toast({
        title: "Success",
        description: "Role created successfully",
      });
      navigate("/users/roles");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create role",
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: { name: string; description?: string; permissionIds: number[]; isDefault: boolean; isActive: boolean }) =>
      userGroupService.update(Number(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-groups'] });
      toast({
        title: "Success",
        description: "Role updated successfully",
      });
      navigate("/users/roles");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update role",
        variant: "destructive",
      });
    },
  });

  // Group permissions by category
  const groupedPermissions = useMemo(() => {
    return permissions.reduce((acc, permission) => {
      const category = permission.category || 'Other';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(permission);
      return acc;
    }, {} as Record<string, typeof permissions>);
  }, [permissions]);

  const categories = Object.keys(groupedPermissions).sort();

  // Handle checkbox change
  const handlePermissionToggle = (permissionId: number, checked: boolean) => {
    if (checked) {
      setSelectedPermissions(prev => [...prev, permissionId]);
    } else {
      setSelectedPermissions(prev => prev.filter(id => id !== permissionId));
    }
  };

  // Select all permissions in a category
  const handleSelectAllInCategory = (category: string, checked: boolean) => {
    const categoryPermIds = groupedPermissions[category].map(p => p.id);
    if (checked) {
      setSelectedPermissions(prev => [...new Set([...prev, ...categoryPermIds])]);
    } else {
      setSelectedPermissions(prev => prev.filter(id => !categoryPermIds.includes(id)));
    }
  };

  // Check if all permissions in a category are selected
  const isCategoryFullySelected = (category: string) => {
    const categoryPermIds = groupedPermissions[category].map(p => p.id);
    return categoryPermIds.every(id => selectedPermissions.includes(id));
  };

  // Check if some permissions in a category are selected
  const isCategoryPartiallySelected = (category: string) => {
    const categoryPermIds = groupedPermissions[category].map(p => p.id);
    const selectedInCategory = categoryPermIds.filter(id => selectedPermissions.includes(id));
    return selectedInCategory.length > 0 && selectedInCategory.length < categoryPermIds.length;
  };

  const handleSubmit = () => {
    if (!roleName.trim()) {
      toast({
        title: "Error",
        description: "Role name is required",
        variant: "destructive",
      });
      return;
    }

    const data = {
      name: roleName,
      description: roleDescription,
      permissionIds: selectedPermissions,
      isDefault,
      isActive,
    };

    if (isEditMode) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading = loadingPermissions || (isEditMode && loadingRole);

  if (isLoading) {
    return (
      <MainLayout title={isEditMode ? "Edit Role" : "Create Role"} subtitle={isEditMode ? "Update role permissions" : "Define a new role with custom permissions"}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      title={isEditMode ? "Edit Role" : "Create Role"}
      subtitle={isEditMode ? "Update role permissions" : "Define a new role with custom permissions"}
    >
      <div className="max-w-4xl animate-fade-in">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate("/users/roles")}
          className="mb-6 -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Roles
        </Button>

        <div className="space-y-6">
          {/* Role Information */}
          <div className="bg-card rounded-xl p-6 shadow-card border border-border/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Role Information</h2>
                <p className="text-sm text-muted-foreground">Basic details about this role</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="roleName">Role Name *</Label>
                <Input 
                  id="roleName" 
                  placeholder="e.g., Senior Waiter" 
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="roleDescription">Description</Label>
                <Textarea 
                  id="roleDescription" 
                  placeholder="Describe the responsibilities and scope of this role..."
                  rows={2}
                  value={roleDescription}
                  onChange={(e) => setRoleDescription(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="isDefault"
                  checked={isDefault}
                  onCheckedChange={(checked) => setIsDefault(checked as boolean)}
                />
                <Label htmlFor="isDefault" className="text-sm text-muted-foreground">
                  Set as default role for new users
                </Label>
              </div>
            </div>
          </div>

          {/* Permissions */}
          <div className="bg-card rounded-xl p-6 shadow-card border border-border/50">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-chart-3/10 flex items-center justify-center">
                  <Settings className="h-5 w-5 text-chart-3" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Permissions</h2>
                  <p className="text-sm text-muted-foreground">Select what this role can access</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  if (selectedPermissions.length === permissions.length) {
                    setSelectedPermissions([]);
                  } else {
                    setSelectedPermissions(permissions.map(p => p.id));
                  }
                }}
              >
                {selectedPermissions.length === permissions.length ? "Deselect All" : "Select All"}
              </Button>
            </div>

            <div className="space-y-6">
              {categories.map((category) => (
                <div key={category} className="space-y-3">
                  <h3 className="font-medium text-foreground flex items-center gap-2">
                    <Checkbox
                      id={`category-${category}`}
                      checked={isCategoryFullySelected(category)}
                      onCheckedChange={(checked) => handleSelectAllInCategory(category, checked as boolean)}
                    />
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                    {isCategoryPartiallySelected(category) && (
                      <span className="text-xs text-muted-foreground">(some selected)</span>
                    )}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-6">
                    {groupedPermissions[category].map((permission) => (
                      <div 
                        key={permission.id}
                        className="flex items-start space-x-3 p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors"
                      >
                        <Checkbox 
                          id={`perm-${permission.id}`}
                          checked={selectedPermissions.includes(permission.id)}
                          onCheckedChange={(checked) => handlePermissionToggle(permission.id, checked as boolean)}
                          className="mt-0.5" 
                        />
                        <div className="flex-1">
                          <label 
                            htmlFor={`perm-${permission.id}`}
                            className="text-sm font-medium text-foreground cursor-pointer"
                          >
                            {formatPermissionName(permission.name)}
                          </label>
                          {permission.description && (
                            <p className="text-xs text-muted-foreground">{permission.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-card rounded-xl p-4 shadow-card border border-border/50">
            <p className="text-sm text-muted-foreground">
              Selected <span className="font-medium text-foreground">{selectedPermissions.length}</span> of{" "}
              <span className="font-medium text-foreground">{permissions.length}</span> permissions
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4">
            <Button variant="outline" onClick={() => navigate("/users/roles")}>
              Cancel
            </Button>
            <Button
              className="gradient-primary text-primary-foreground shadow-glow"
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditMode ? "Update Role" : "Create Role"}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
