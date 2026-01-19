import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Save, Shield, Eye, PenSquare, Trash2, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

const permissionGroups = [
  {
    name: "Orders",
    permissions: [
      { id: "orders-view", label: "View orders", description: "Can view all orders" },
      { id: "orders-create", label: "Create orders", description: "Can create new orders" },
      { id: "orders-update", label: "Update orders", description: "Can modify order status and details" },
      { id: "orders-delete", label: "Delete orders", description: "Can cancel or delete orders" },
    ]
  },
  {
    name: "Menu",
    permissions: [
      { id: "menu-view", label: "View menu", description: "Can view menu items" },
      { id: "menu-create", label: "Create menu items", description: "Can add new menu items" },
      { id: "menu-update", label: "Update menu items", description: "Can modify menu items" },
      { id: "menu-delete", label: "Delete menu items", description: "Can remove menu items" },
    ]
  },
  {
    name: "Inventory",
    permissions: [
      { id: "inventory-view", label: "View inventory", description: "Can view stock levels" },
      { id: "inventory-manage", label: "Manage inventory", description: "Can add/update inventory items" },
      { id: "purchases-create", label: "Create purchase orders", description: "Can create purchase orders" },
      { id: "purchases-approve", label: "Approve purchases", description: "Can approve purchase orders" },
    ]
  },
  {
    name: "Kitchen & Bar",
    permissions: [
      { id: "kitchen-view", label: "View kitchen orders", description: "Can view kitchen display" },
      { id: "kitchen-update", label: "Update kitchen status", description: "Can update cooking status" },
      { id: "bar-view", label: "View bar orders", description: "Can view bar display" },
      { id: "bar-update", label: "Update bar status", description: "Can update drink status" },
    ]
  },
  {
    name: "Users & Roles",
    permissions: [
      { id: "users-view", label: "View users", description: "Can view staff members" },
      { id: "users-manage", label: "Manage users", description: "Can create/edit users" },
      { id: "roles-view", label: "View roles", description: "Can view roles" },
      { id: "roles-manage", label: "Manage roles", description: "Can create/edit roles" },
    ]
  },
  {
    name: "Reports & Accounting",
    permissions: [
      { id: "reports-view", label: "View reports", description: "Can view analytics and reports" },
      { id: "accounting-view", label: "View accounting", description: "Can view financial data" },
      { id: "accounting-manage", label: "Manage accounting", description: "Can edit financial records" },
    ]
  },
  {
    name: "Settings",
    permissions: [
      { id: "settings-view", label: "View settings", description: "Can view system settings" },
      { id: "settings-manage", label: "Manage settings", description: "Can modify system settings" },
    ]
  },
];

export default function RoleNew() {
  const navigate = useNavigate();

  return (
    <MainLayout title="Create Role" subtitle="Define a new role with custom permissions">
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
                <Input id="roleName" placeholder="e.g., Senior Waiter" />
              </div>
              {/* <div className="space-y-2">
                <Label htmlFor="roleColor">Role Color</Label>
                <Input id="roleColor" type="color" defaultValue="#8B5CF6" className="h-10 w-full" />
              </div> */}
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="roleDescription">Description</Label>
                <Textarea 
                  id="roleDescription" 
                  placeholder="Describe the responsibilities and scope of this role..."
                  rows={2}
                />
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
              <Button variant="outline" size="sm">
                Select All
              </Button>
            </div>

            <div className="space-y-6">
              {permissionGroups.map((group) => (
                <div key={group.name} className="space-y-3">
                  <h3 className="font-medium text-foreground flex items-center gap-2">
                    {group.name}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {group.permissions.map((permission) => (
                      <div 
                        key={permission.id}
                        className="flex items-start space-x-3 p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors"
                      >
                        <Checkbox id={permission.id} className="mt-0.5" />
                        <div className="flex-1">
                          <label 
                            htmlFor={permission.id}
                            className="text-sm font-medium text-foreground cursor-pointer"
                          >
                            {permission.label}
                          </label>
                          <p className="text-xs text-muted-foreground">{permission.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4">
            <Button variant="outline" onClick={() => navigate("/users/roles")}>
              Cancel
            </Button>
            <Button className="gradient-primary text-primary-foreground shadow-glow">
              <Save className="h-4 w-4 mr-2" />
              Create Role
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
