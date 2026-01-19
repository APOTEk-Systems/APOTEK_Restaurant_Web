import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, MoreHorizontal, Shield, Users, Edit, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";

const roles = [
  { 
    id: 1, 
    name: "Admin", 
    description: "Full system access with all permissions",
    permissions: ["All permissions"],
    userCount: 1,
    color: "bg-primary/10 text-primary border-primary/20"
  },
  { 
    id: 2, 
    name: "Chef", 
    description: "Kitchen management and order preparation",
    permissions: ["View orders", "Update order status", "Manage recipes", "View inventory"],
    userCount: 2,
    color: "bg-warning/10 text-warning border-warning/20"
  },
  { 
    id: 3, 
    name: "Bartender", 
    description: "Bar operations and drink orders",
    permissions: ["View bar orders", "Update drink status", "View bar inventory"],
    userCount: 2,
    color: "bg-chart-5/10 text-chart-5 border-chart-5/20"
  },
  { 
    id: 4, 
    name: "Inventory Manager", 
    description: "Stock and inventory control",
    permissions: ["Manage inventory", "Create purchase orders", "View reports", "Manage suppliers"],
    userCount: 1,
    color: "bg-chart-3/10 text-chart-3 border-chart-3/20"
  },
  { 
    id: 5, 
    name: "Waiter", 
    description: "Table service and order taking",
    permissions: ["Create orders", "View orders", "Update order status", "View menu"],
    userCount: 5,
    color: "bg-success/10 text-success border-success/20"
  },
];

export default function Roles() {
  const navigate = useNavigate();

  return (
    <MainLayout title="Roles" subtitle="Manage user roles and permissions">
      <div className="space-y-6 animate-fade-in">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
            <p className="text-sm text-muted-foreground">Total Roles</p>
            <p className="text-2xl font-bold text-foreground mt-1">{roles.length}</p>
          </div>
          <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
            <p className="text-sm text-muted-foreground">Total Users</p>
            <p className="text-2xl font-bold text-primary mt-1">{roles.reduce((acc, r) => acc + r.userCount, 0)}</p>
          </div>
          <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
            <p className="text-sm text-muted-foreground">Custom Roles</p>
            <p className="text-2xl font-bold text-foreground mt-1">0</p>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search roles..." className="pl-9" />
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Role</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Users</TableHead>
             
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map((role) => (
              <TableRow key={role.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", role.color)}>
                      <Shield className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground text-lg">{role.name}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-muted-foreground">{role.description}</div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{role.userCount} user{role.userCount !== 1 ? 's' : ''}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </MainLayout>
  );
}
