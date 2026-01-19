import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Search, Plus, Phone, Mail, Calendar, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";

const staff = [
  { 
    id: 1, 
    name: "John Doe", 
    position: "Head Chef", 
    department: "Kitchen",
    phone: "+1 555-0101", 
    email: "john.doe@restaurant.com",
    hireDate: "2022-03-15",
    status: "active",
    hasAccount: true
  },
  { 
    id: 2, 
    name: "Jane Smith", 
    position: "Sous Chef", 
    department: "Kitchen",
    phone: "+1 555-0102", 
    email: "jane.smith@restaurant.com",
    hireDate: "2022-06-20",
    status: "active",
    hasAccount: true
  },
  { 
    id: 3, 
    name: "Mike Johnson", 
    position: "Bartender", 
    department: "Bar",
    phone: "+1 555-0103", 
    email: "mike.johnson@restaurant.com",
    hireDate: "2023-01-10",
    status: "active",
    hasAccount: true
  },
  { 
    id: 4, 
    name: "Sarah Wilson", 
    position: "Server", 
    department: "Front of House",
    phone: "+1 555-0104", 
    email: "sarah.wilson@restaurant.com",
    hireDate: "2023-02-28",
    status: "active",
    hasAccount: false
  },
  { 
    id: 5, 
    name: "David Brown", 
    position: "Host", 
    department: "Front of House",
    phone: "+1 555-0105", 
    email: "david.brown@restaurant.com",
    hireDate: "2023-04-15",
    status: "active",
    hasAccount: false
  },
  { 
    id: 6, 
    name: "Emily Davis", 
    position: "Dishwasher", 
    department: "Kitchen",
    phone: "+1 555-0106", 
    email: "emily.davis@restaurant.com",
    hireDate: "2023-05-01",
    status: "inactive",
    hasAccount: false
  },
  { 
    id: 7, 
    name: "Chris Martinez", 
    position: "Line Cook", 
    department: "Kitchen",
    phone: "+1 555-0107", 
    email: "chris.martinez@restaurant.com",
    hireDate: "2023-06-10",
    status: "active",
    hasAccount: false
  },
  { 
    id: 8, 
    name: "Amanda Taylor", 
    position: "Inventory Manager", 
    department: "Operations",
    phone: "+1 555-0108", 
    email: "amanda.taylor@restaurant.com",
    hireDate: "2022-09-01",
    status: "active",
    hasAccount: true
  },
];

const departmentColors: Record<string, string> = {
  "Kitchen": "bg-orange-500/10 text-orange-500",
  "Bar": "bg-purple-500/10 text-purple-500",
  "Front of House": "bg-blue-500/10 text-blue-500",
  "Operations": "bg-green-500/10 text-green-500",
};

const Staff = () => {
  const navigate = useNavigate();
  
  const totalStaff = staff.length;
  const activeStaff = staff.filter(s => s.status === "active").length;
  const withAccounts = staff.filter(s => s.hasAccount).length;
  const departments = [...new Set(staff.map(s => s.department))].length;

  return (
    <MainLayout 
      title="Staff" 
      subtitle="Manage all staff members"
    >
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Staff</p>
            <p className="text-2xl font-bold text-foreground">{totalStaff}</p>
            <p className="text-xs text-muted-foreground">All employees</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Active</p>
            <p className="text-2xl font-bold text-primary">{activeStaff}</p>
            <p className="text-xs text-muted-foreground">Currently employed</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">With System Access</p>
            <p className="text-2xl font-bold text-blue-500">{withAccounts}</p>
            <p className="text-xs text-muted-foreground">Have user accounts</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Departments</p>
            <p className="text-2xl font-bold text-foreground">{departments}</p>
            <p className="text-xs text-muted-foreground">Active departments</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search staff..." 
            className="pl-10 bg-card border-border"
          />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-full sm:w-48 bg-card border-border">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            <SelectItem value="kitchen">Kitchen</SelectItem>
            <SelectItem value="bar">Bar</SelectItem>
            <SelectItem value="foh">Front of House</SelectItem>
            <SelectItem value="operations">Operations</SelectItem>
          </SelectContent>
        </Select>
        <Button 
          className="gradient-primary text-primary-foreground shadow-glow"
          onClick={() => navigate("/staff/new")}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Staff Member
        </Button>
      </div>

      {/* Staff Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Position</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Hire Date</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {staff.map((member) => (
            <TableRow key={member.id} className={cn(
              "cursor-pointer",
              member.status === "inactive" && "opacity-60"
            )}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-semibold text-primary">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{member.name}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm text-muted-foreground">{member.position}</div>
              </TableCell>
              <TableCell>
                <Badge className={cn("text-xs", departmentColors[member.department])}>
                  {member.department}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5" />
                    <span>{member.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5" />
                    <span className="truncate">{member.email}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{new Date(member.hireDate).toLocaleDateString()}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  {member.hasAccount && (
                    <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-500">
                      Has Account
                    </Badge>
                  )}
                  {member.status === "inactive" && (
                    <Badge variant="outline" className="text-xs border-muted-foreground text-muted-foreground">
                      Inactive
                    </Badge>
                  )}
                  {member.status === "active" && !member.hasAccount && (
                    <Badge variant="outline" className="text-xs border-success/30 text-success">
                      Active
                    </Badge>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </MainLayout>
  );
};

export default Staff;