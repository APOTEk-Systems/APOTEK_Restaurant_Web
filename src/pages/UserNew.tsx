import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, User, Shield, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { userService, CreateUserData } from "@/services/userService";
import { userGroupService } from "@/services/userGroupService";
import { staffService, Staff } from "@/services/staffService";

export default function UserNew() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    staffId: undefined as number | undefined,
    userGroupId: undefined as number | undefined,
  });

  // Fetch user groups
  const { data: userGroups = [] } = useQuery({
    queryKey: ["user-groups"],
    queryFn: () => userGroupService.getAll(),
  });

  // Fetch users to check which staff already have user accounts
  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: () => userService.getAll(),
  });

  // Fetch staff members
  const { data: staffMembers = [], isLoading: loadingStaff } = useQuery({
    queryKey: ["staff"],
    queryFn: () => staffService.getAll(),
  });

  // Filter available staff (those who don't have a user account yet)
  const assignedStaffIds = new Set(
    users.map((user) => user.staffId).filter(Boolean)
  );
  const availableStaff = staffMembers.filter(
    (staff: Staff) => !assignedStaffIds.has(staff.id)
  );

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: (data: CreateUserData) => userService.create(data),
    onSuccess: () => {
      toast({ title: "Success", description: "User created successfully" });
      navigate("/users");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create user",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async () => {
    // Validation
    if (!formData.staffId) {
      toast({
        title: "Error",
        description:
          "Please select a staff member to associate with this user account",
        variant: "destructive",
      });
      return;
    }
    if (!formData.username || !formData.userGroupId) {
      toast({
        title: "Error",
        description: "Username and role are required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.password || formData.password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await createUserMutation.mutateAsync({
        username: formData.username,
        email: formData.email || undefined,
        password: formData.password,
        staffId: formData.staffId,
        userGroupId: formData.userGroupId,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string | number | undefined) => {
    if (field === "staffId" && value) {
      // Find the selected staff member
      const selectedStaff = staffMembers.find((s: Staff) => s.id === value);
      if (selectedStaff) {
        // Auto-fill username (firstName + lastName) and email from staff
        const username = `${selectedStaff.firstName.trim()} ${selectedStaff.lastName.trim()}`;
        setFormData((prev) => ({
          ...prev,
          staffId: value as number,
          username: username,
          email: selectedStaff.email || "",
        }));
        return;
      }
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <MainLayout title="Add User" subtitle="Create a new user account">
      <div className="max-w-3xl animate-fade-in">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/users")}
          className="mb-6 -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Users
        </Button>

        {loadingStaff ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>User Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Staff Member & Role - First Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="staff">Staff Member</Label>
                  <Select
                    value={
                      formData.staffId ? formData.staffId.toString() : "none"
                    }
                    onValueChange={(value) =>
                      handleChange(
                        "staffId",
                        value === "none" ? undefined : parseInt(value)
                      )
                    }
                  >
                    <SelectTrigger id="staff">
                      <SelectValue placeholder="Select staff member (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No staff association</SelectItem>
                      {availableStaff.map((staff) => (
                        <SelectItem key={staff.id} value={staff.id.toString()}>
                          {staff.firstName} {staff.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="userGroup">Role *</Label>
                  <Select
                    value={
                      formData.userGroupId
                        ? formData.userGroupId.toString()
                        : ""
                    }
                    onValueChange={(value) =>
                      handleChange(
                        "userGroupId",
                        value ? parseInt(value) : undefined
                      )
                    }
                  >
                    <SelectTrigger id="userGroup">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {userGroups.map((group) => (
                        <SelectItem key={group.id} value={group.id.toString()}>
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Account Credentials */}
              <div className="space-y-4 pt-4 border-t border-border">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Account Credentials
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username *</Label>
                    <Input
                      id="username"
                      placeholder="Enter username"
                      value={formData.username}
                      onChange={(e) => handleChange("username", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@example.com"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter password (min 6 characters)"
                      value={formData.password}
                      onChange={(e) => handleChange("password", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm password"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        handleChange("confirmPassword", e.target.value)
                      }
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end pt-4 border-t border-border">
                <Button variant="outline" onClick={() => navigate("/users")}>
                  Cancel
                </Button>
                <Button
                  className="gradient-primary text-primary-foreground shadow-glow"
                  onClick={handleSubmit}
                  disabled={isLoading || createUserMutation.isPending}
                >
                  {isLoading || createUserMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Create User
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
