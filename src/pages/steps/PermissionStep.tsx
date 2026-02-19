import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { Permission, UserGroup } from "@/services/userGroupService";

interface PermissionOverride {
  permissionId: number;
  allowed: boolean;
}

interface PermissionStepProps {
  permissions: Permission[];
  userGroups: UserGroup[];
  userGroupId: number | undefined;
  permissionOverrides: PermissionOverride[];
  setPermissionOverrides: React.Dispatch<React.SetStateAction<PermissionOverride[]>>;
}

// Convert permission name to human readable format
// e.g., "accounting.expenses" -> "Accounting Expenses"
// e.g., "menu_items" -> "Menu Items"
function formatPermissionName(name: string): string {
  return name
    .replace(/_/g, ' ')  // Replace underscores with spaces
    .split('.')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

export default function PermissionStep({
  permissions,
  userGroups,
  userGroupId,
  permissionOverrides,
  setPermissionOverrides,
}: PermissionStepProps) {
  // Get the selected user group
  const selectedGroup = userGroups.find(g => g.id === userGroupId);
  
  // Get group permission IDs (the default permissions)
  const groupPermissionIds = new Set(
    selectedGroup?.permissions?.map(p => p.permission.id) || []
  );

  // Check if a permission is currently allowed (considering overrides)
  const isPermissionAllowed = (permissionId: number): boolean => {
    const override = permissionOverrides.find(p => p.permissionId === permissionId);
    if (override !== undefined) {
      return override.allowed;
    }
    // If no override, use group default
    return groupPermissionIds.has(permissionId);
  };

  // Handle checkbox change
  const handlePermissionChange = (permissionId: number, checked: boolean) => {
    const isInGroup = groupPermissionIds.has(permissionId);
    
    if (checked) {
      // If checking - add to allowed list (override to true)
      // If it was already in the group, remove the override to use group default
      if (isInGroup) {
        setPermissionOverrides(prev => prev.filter(p => p.permissionId !== permissionId));
      } else {
        // Add as explicit allow
        setPermissionOverrides(prev => [
          ...prev.filter(p => p.permissionId !== permissionId),
          { permissionId, allowed: true }
        ]);
      }
    } else {
      // If unchecking - remove from allowed list
      // If it was in the group, add override to deny
      if (isInGroup) {
        setPermissionOverrides(prev => [
          ...prev.filter(p => p.permissionId !== permissionId),
          { permissionId, allowed: false }
        ]);
      } else {
        // Already not in group, just remove any override
        setPermissionOverrides(prev => prev.filter(p => p.permissionId !== permissionId));
      }
    }
  };

  // Check if there's an override for this permission (to show different from default)
  const hasOverride = (permissionId: number): boolean => {
    return permissionOverrides.some(p => p.permissionId === permissionId);
  };

  // Group permissions by category
  const groupedPermissions = permissions.reduce((acc, permission) => {
    const category = permission.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  const categories = Object.keys(groupedPermissions).sort();

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>Permission Overrides</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Select permissions to grant this user. By default, permissions from the selected user group are included.
          Check additional permissions to grant or uncheck to revoke.
        </p>

        <div className="border rounded-lg max-h-[500px] overflow-y-auto">
          {categories.map((category) => (
            <div key={category}>
              <div className="sticky top-0 bg-muted px-3 py-2 font-medium text-sm border-b">
                {category}
              </div>
              {groupedPermissions[category].map((permission) => {
                const isAllowed = isPermissionAllowed(permission.id);
                const isOverridden = hasOverride(permission.id);
                const isInGroup = groupPermissionIds.has(permission.id);

                return (
                  <div 
                    key={permission.id} 
                    className={`flex items-center justify-between p-3 border-b last:border-b-0 hover:bg-muted/50 ${isOverridden ? 'bg-muted/30' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox 
                        id={`perm-${permission.id}`}
                        checked={isAllowed}
                        onCheckedChange={(checked) => handlePermissionChange(permission.id, checked as boolean)}
                      />
                      <div>
                        <Label 
                          htmlFor={`perm-${permission.id}`} 
                          className="font-medium text-sm cursor-pointer"
                        >
                          {formatPermissionName(permission.name)}
                        </Label>
                        {permission.description && (
                          <p className="text-xs text-muted-foreground">{permission.description}</p>
                        )}
                        {isInGroup && !isOverridden && (
                          <p className="text-xs text-green-600">From group: {selectedGroup?.name}</p>
                        )}
                        {isOverridden && (
                          <p className="text-xs text-blue-600">
                            {isAllowed ? 'Explicitly allowed' : 'Explicitly denied'}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <div className="text-sm text-muted-foreground">
          <p>Total permissions: {permissions.length}</p>
          <p>Group default: {groupPermissionIds.size}</p>
          <p>Current allowed: {permissions.filter(p => isPermissionAllowed(p.id)).length}</p>
        </div>
      </CardContent>
    </Card>
  );
}