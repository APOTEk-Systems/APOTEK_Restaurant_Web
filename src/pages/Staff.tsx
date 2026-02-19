import { useEffect, useState } from "react";
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
import { staffService, type Staff } from "@/services/staffService";

const departmentColors: Record<string, string> = {
  "KITCHEN": "bg-orange-500/10 text-orange-500",
  "BAR": "bg-purple-500/10 text-purple-500",
  "SERVICE": "bg-blue-500/10 text-blue-500",
  "OPERATIONS": "bg-green-500/10 text-green-500",
  "MANAGEMENT": "bg-red-500/10 text-red-500",
};

const Staff = () => {
  const navigate = useNavigate();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setIsLoading(true);
      const data = await staffService.getAll();
      setStaff(data);
    } catch (error) {
      console.error("Failed to fetch staff:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStaff = staff.filter(member => {
    const matchesSearch =
      member.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.role?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = 
      departmentFilter === "all" || 
      member.department?.toUpperCase() === departmentFilter.toUpperCase();
    
    return matchesSearch && matchesDepartment;
  });

  const totalStaff = filteredStaff.length;
  const activeStaff = filteredStaff.filter(s => s.status === "ACTIVE" || s.status === "active").length;
  const departments = [...new Set(staff.map(s => s.department).filter(Boolean))].length;

  const formatDepartment = (dept: string | undefined) => {
    if (!dept) return "N/A";
    const deptMap: Record<string, string> = {
      "KITCHEN": "Kitchen",
      "BAR": "Bar",
      "SERVICE": "Front of House",
      "OPERATIONS": "Operations",
      "MANAGEMENT": "Management"
    };
    return deptMap[dept.toUpperCase()] || dept;
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
            <SelectItem value="KITCHEN">Kitchen</SelectItem>
            <SelectItem value="BAR">Bar</SelectItem>
            <SelectItem value="SERVICE">Front of House</SelectItem>
            <SelectItem value="OPERATIONS">Operations</SelectItem>
            <SelectItem value="MANAGEMENT">Management</SelectItem>
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
              <TableHead>Position</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Hire Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStaff.map((member) => (
              <TableRow key={member.id} className={cn(
                "cursor-pointer",
                (member.status === "INACTIVE" || member.status === "inactive") && "opacity-60"
              )}>
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
                    <span>{member.role || "N/A"}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={cn("text-xs", departmentColors[member.department?.toUpperCase() || ""])}>
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