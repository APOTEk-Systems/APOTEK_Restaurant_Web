import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Shield, Users, Edit, Trash2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { userGroupService } from "@/services/userGroupService";
import { userService } from "@/services/userService";
import { useQuery } from "@tanstack/react-query";

// Generate consistent colors for roles based on name
const getRoleColor = (roleName: string): string => {
  const colors: Record<string, string> = {
    "Admin": "bg-primary/10 text-primary border-primary/20",
    "Manager": "bg-chart-3/10 text-chart-3 border-chart-3/20",
    "Waiter": "bg-success/10 text-success border-success/20",
    "Kitchen": "bg-warning/10 text-warning border-warning/20",
    "Bartender": "bg-chart-5/10 text-chart-5 border-chart-5/20",
  };
  
  const upperName = roleName.toUpperCase();
  if (colors[upperName]) return colors[upperName];
  
  // Generate consistent color for other roles
  const colorClasses = [
    "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
    "bg-pink-500/10 text-pink-500 border-pink-500/20",
    "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
    "bg-teal-500/10 text-teal-500 border-teal-500/20",
  ];
  
  const hash = roleName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colorClasses[hash % colorClasses.length];
};

export default function Roles() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  // React Query for data fetching
  const { data: userGroups = [], isLoading } = useQuery({
    queryKey: ['user-groups'],
    queryFn: () => userGroupService.getAll(),
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getAll(),
  });

  // Filter roles based on search
  const filteredRoles = userGroups.filter(role => 
    !searchTerm || 
    role.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Count users per role
  const getUserCount = (roleId: number) => {
    return users.filter(u => u.userGroupId === roleId).length;
  };

  // Get permission count for a role
  const getPermissionCount = (role: typeof userGroups[0]) => {
    return role.permissions?.length || 0;
  };

  return (
    <MainLayout title="Roles" subtitle="Manage user roles and permissions">
      <div className="space-y-6 animate-fade-in">
        {/* Stats */}
      

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search roles..." 
              className="pl-9" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button 
            onClick={() => navigate("/users/roles/new")}
            className="gradient-primary text-primary-foreground shadow-glow hover:shadow-lg transition-shadow"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Role
          </Button>
        </div>

        {/* Roles Table */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRoles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", getRoleColor(role.name))}>
                        <Shield className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-semibold text-foreground text-lg">{role.name}</div>
                        {role.isDefault && (
                          <span className="text-xs text-muted-foreground">Default</span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">{role.description || "No description"}</div>
                  </TableCell>
                
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{getUserCount(role.id)} user{getUserCount(role.id) !== 1 ? 's' : ''}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {role.isActive ? (
                      <span className="text-xs text-success">Active</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Inactive</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => navigate(`/users/roles/edit/${role.id}`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {!role.isDefault && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </MainLayout>
  );
}
