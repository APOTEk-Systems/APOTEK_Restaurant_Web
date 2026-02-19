import { useState } from "react";
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
import { Search, Plus, Phone, Mail, Calendar, Briefcase, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { staffService } from "@/services/staffService";
import { departmentService } from "@/services/departmentService";
import type { Staff } from "@/services/staffService";
import type { Department } from "@/services/staffService";
import { useQuery } from "@tanstack/react-query";

// Generate consistent colors for departments based on their name
const getDepartmentColor = (deptName: string | undefined): string => {
  if (!deptName) return "bg-muted/10 text-muted-foreground";
  
  const colors: Record<string, string> = {
    "KITCHEN": "bg-orange-500/10 text-orange-500",
    "BAR": "bg-purple-500/10 text-purple-500",
    "FRONT OF HOUSE": "bg-blue-500/10 text-blue-500",
    "SERVICE": "bg-blue-500/10 text-blue-500",
    "OPERATIONS": "bg-green-500/10 text-green-500",
    "MANAGEMENT": "bg-red-500/10 text-red-500",
  };
  
  // Use a hash-based color for unknown departments
  const upperName = deptName.toUpperCase();
  if (colors[upperName]) return colors[upperName];
  
  // Generate a consistent color based on department name
  const colorClasses = [
    "bg-cyan-500/10 text-cyan-500",
    "bg-pink-500/10 text-pink-500",
    "bg-indigo-500/10 text-indigo-500",
    "bg-teal-500/10 text-teal-500",
    "bg-amber-500/10 text-amber-500",
  ];
  
  const hash = deptName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colorClasses[hash % colorClasses.length];
};

const Staff = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  // React Query for data fetching
  const { data: staff = [], isLoading: loadingStaff } = useQuery({
    queryKey: ['staff'],
    queryFn: () => staffService.getAll(),
  });

  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: () => departmentService.getAll(),
  });

  const isLoading = loadingStaff;

  const filteredStaff = staff.filter(member => {
    const fullName = `${member.firstName} ${member.lastName}`.toLowerCase();
    const matchesSearch = 
      fullName.includes(searchTerm.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.role?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.department?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = 
      departmentFilter === "all" || 
      member.departmentId?.toString() === departmentFilter ||
      member.department?.name?.toUpperCase() === departmentFilter.toUpperCase();
    
    return matchesSearch && matchesDepartment;
  });

  const totalStaff = filteredStaff.length;
  const activeStaff = filteredStaff.filter(s => s.status === "ACTIVE" || s.status === "active").length;
  const uniqueDepartments = [...new Set(staff.map(s => s.department?.name).filter(Boolean))].length;

  const formatDepartment = (dept: { name: string } | undefined | null) => {
    if (!dept) return "N/A";
    return dept.name;
  };

  const formatRole = (role: { name: string } | undefined | null) => {
    if (!role) return "N/A";
    return role.name;
  };

  return (
    <MainLayout 
      title="Staff" 
      subtitle="Manage all staff members"
    >
    

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search staff..." 
            className="pl-10 bg-card border-border"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="w-full sm:w-48 bg-card border-border">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept.id} value={dept.id.toString()}>
                {dept.name}
              </SelectItem>
            ))}
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
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredStaff.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No staff members found.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => navigate("/staff/new")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Staff Member
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Hire Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStaff.map((member) => (
              <TableRow
                key={member.id}
                className={cn(
                  "cursor-pointer hover:bg-muted/50",
                  (member.status === "INACTIVE" || member.status === "inactive") && "opacity-60"
                )}
                onClick={() => navigate(`/staff/edit/${member.id}`)}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                      {member.imageUrl ? (
                        <img src={member.imageUrl} alt={`${member.firstName} ${member.lastName}`} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-lg font-semibold text-primary">
                          {member.firstName?.[0]}{member.lastName?.[0]}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">
                        {member.firstName} {member.lastName}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Briefcase className="h-3.5 w-3.5" />
                    <span>{formatRole(member.role)}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={cn("text-xs", getDepartmentColor(member.department?.name))}>
                    {formatDepartment(member.department)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    {member.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5" />
                        <span>{member.phone}</span>
                      </div>
                    )}
                    {member.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5" />
                        <span className="truncate">{member.email}</span>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      {member.hireDate 
                        ? new Date(member.hireDate).toLocaleDateString() 
                        : "N/A"}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {(member.status === "ACTIVE" || member.status === "active") && (
                      <Badge variant="outline" className="text-xs border-success/30 text-success">
                        Active
                      </Badge>
                    )}
                    {(member.status === "INACTIVE" || member.status === "inactive") && (
                      <Badge variant="outline" className="text-xs border-muted-foreground text-muted-foreground">
                        Inactive
                      </Badge>
                    )}
                    {(member.status === "ON_LEAVE" || member.status === "on_leave") && (
                      <Badge variant="outline" className="text-xs border-yellow-500/30 text-yellow-500">
                        On Leave
                      </Badge>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </MainLayout>
  );
};

export default Staff;