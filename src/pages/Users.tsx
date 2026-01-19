import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, MoreHorizontal, Mail, Phone, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";

const users = [
  { id: 1, name: "John Doe", email: "john.doe@restaurant.com", phone: "(555) 123-4567", role: "Admin", status: "active", avatar: "" },
  { id: 2, name: "Sarah Mitchell", email: "sarah.m@restaurant.com", phone: "(555) 234-5678", role: "Manager", status: "active", avatar: "" },
  { id: 3, name: "Mike Rodriguez", email: "mike.r@restaurant.com", phone: "(555) 345-6789", role: "Server", status: "active", avatar: "" },
  { id: 4, name: "Emily Chen", email: "emily.c@restaurant.com", phone: "(555) 456-7890", role: "Server", status: "active", avatar: "" },
  { id: 5, name: "James Thompson", email: "james.t@restaurant.com", phone: "(555) 567-8901", role: "Chef", status: "active", avatar: "" },
  { id: 6, name: "Lisa Anderson", email: "lisa.a@restaurant.com", phone: "(555) 678-9012", role: "Host", status: "inactive", avatar: "" },
  { id: 7, name: "David Kim", email: "david.k@restaurant.com", phone: "(555) 789-0123", role: "Bartender", status: "active", avatar: "" },
  { id: 8, name: "Anna Martinez", email: "anna.m@restaurant.com", phone: "(555) 890-1234", role: "Server", status: "active", avatar: "" },
];

const roleColors = {
  Admin: "bg-primary/10 text-primary border-primary/20",
  Manager: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  Server: "bg-success/10 text-success border-success/20",
  Chef: "bg-warning/10 text-warning border-warning/20",
  Host: "bg-chart-4/10 text-chart-4 border-chart-4/20",
  Bartender: "bg-chart-5/10 text-chart-5 border-chart-5/20",
};

export default function Users() {
  const navigate = useNavigate();

  return (
    <MainLayout title="Users" subtitle="Manage staff members and their roles">
      <div className="space-y-6 animate-fade-in">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
            <p className="text-sm text-muted-foreground">Total Staff</p>
            <p className="text-2xl font-bold text-foreground mt-1">{users.length}</p>
          </div>
          <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
            <p className="text-sm text-muted-foreground">Active</p>
            <p className="text-2xl font-bold text-success mt-1">{users.filter(u => u.status === "active").length}</p>
          </div>
          <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
            <p className="text-sm text-muted-foreground">On Shift Today</p>
            <p className="text-2xl font-bold text-primary mt-1">6</p>
          </div>
          <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
            <p className="text-sm text-muted-foreground">Managers</p>
            <p className="text-2xl font-bold text-foreground mt-1">2</p>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-3">
            <div className="relative flex-1 sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search staff..." className="pl-9" />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="server">Server</SelectItem>
                <SelectItem value="chef">Chef</SelectItem>
                <SelectItem value="host">Host</SelectItem>
                <SelectItem value="bartender">Bartender</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button 
            onClick={() => navigate("/users/new")}
            className="gradient-primary text-primary-foreground shadow-glow hover:shadow-lg transition-shadow"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Staff Member
          </Button>
        </div>

        {/* Users Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} className={user.status === "inactive" && "opacity-60"}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {user.name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-foreground">{user.name}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={cn("capitalize", roleColors[user.role as keyof typeof roleColors])}>
                    <Shield className="h-3 w-3 mr-1" />
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{user.email}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    {user.phone}
                  </div>
                </TableCell>
                <TableCell>
                  {user.status === "inactive" && (
                    <Badge variant="secondary" className="text-xs">Inactive</Badge>
                  )}
                  {user.status === "active" && (
                    <Badge variant="default" className="text-xs bg-success/10 text-success">Active</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </MainLayout>
  );
}
