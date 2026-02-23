import { useState, useEffect, useMemo } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { ArrowLeft, Save, Loader2, Upload } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { staffService, CreateStaffData } from "@/services/staffService";
import { departmentService } from "@/services/departmentService";
import { staffRoleService } from "@/services/staffRoleService";

// Validate Tanzanian phone numbers
function isValidPhoneNumber(phone: string): boolean {
  const cleaned = phone.replace(/\s/g, "");
  if (!cleaned) return true;
  if (/^\d{9}$/.test(cleaned)) return true;
  if (/^\+255\d{9}$/.test(cleaned)) return true;
  if (/^0\d{9}$/.test(cleaned)) return true;
  return false;
}

function transformPhoneForBackend(phone: string): string {
  const cleaned = phone.replace(/\s/g, "");
  if (!cleaned) return cleaned;
  if (/^\+255\d{9}$/.test(cleaned)) return cleaned;
  if (/^\d{9}$/.test(cleaned)) return "+255" + cleaned;
  if (/^0\d{9}$/.test(cleaned)) return "+255" + cleaned.substring(1);
  return cleaned;
}

const StaffEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Form data
  const [formData, setFormData] = useState<CreateStaffData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    departmentId: undefined,
    roleId: undefined,
    hireDate: new Date().toISOString().split("T")[0],
    status: "ACTIVE",
    imageUrl: "",
    emergencyContact: "",
    notes: "",
  });

  // React Query for data fetching
  const { data: departments = [], isLoading: loadingDepartments } = useQuery({
    queryKey: ['departments'],
    queryFn: () => departmentService.getAll(),
  });

  const { data: staffRoles = [], isLoading: loadingRoles } = useQuery({
    queryKey: ['staff-roles'],
    queryFn: () => staffRoleService.getAll(),
  });

  // Fetch existing staff
  const { data: existingStaff, isLoading: loadingStaff } = useQuery({
    queryKey: ['staff', id],
    queryFn: () => staffService.getById(Number(id)),
    enabled: Boolean(id),
  });

  // Populate form when editing
  useEffect(() => {
    if (existingStaff) {
      setFormData({
        firstName: existingStaff.firstName,
        lastName: existingStaff.lastName,
        email: existingStaff.email || "",
        phone: existingStaff.phone || "",
        address: existingStaff.address || "",
        departmentId: existingStaff.departmentId,
        roleId: existingStaff.roleId,
        hireDate: existingStaff.hireDate ? existingStaff.hireDate.split('T')[0] : new Date().toISOString().split('T')[0],
        status: existingStaff.status,
        imageUrl: existingStaff.imageUrl || "",
        emergencyContact: existingStaff.emergencyContact || "",
        notes: existingStaff.notes || "",
      });
    }
  }, [existingStaff]);

  // Filter roles based on selected department
  const filteredRoles = useMemo(() => {
    if (!formData.departmentId) return staffRoles;
    return staffRoles.filter(role => role.departmentId === formData.departmentId);
  }, [formData.departmentId, staffRoles]);

  const isLoadingData = loadingDepartments || loadingRoles || loadingStaff;

  const handleChange = (field: keyof CreateStaffData, value: string | number | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    setIsUploading(true);
    try {
      const result = await staffService.uploadImage(file);
      setFormData(prev => ({ ...prev, imageUrl: result.imageUrl }));
      return result.imageUrl;
    } catch (error) {
      console.error("Failed to upload image:", error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
      return "";
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.firstName || !formData.lastName) {
      toast({
        title: "Error",
        description: "First name and last name are required",
        variant: "destructive",
      });
      return;
    }

    if (formData.phone && !isValidPhoneNumber(formData.phone)) {
      toast({
        title: "Error",
        description: "Invalid phone format. Use: 9 digits, 0XX..., or +255XX...",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const staffData: CreateStaffData = {
        ...formData,
        phone: transformPhoneForBackend(formData.phone || ""),
        hireDate: formData.hireDate ? new Date(formData.hireDate).toISOString() : new Date().toISOString(),
      };

      await staffService.update(Number(id), staffData);
      toast({
        title: "Success",
        description: "Staff member updated successfully",
      });
      navigate("/staff");
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      toast({
        title: "Error",
        description: axiosError.response?.data?.message || "Failed to update staff member",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) {
    return (
      <MainLayout title="Edit Staff Member" subtitle="Update staff information">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      title="Edit Staff Member"
      subtitle="Update staff information"
    >
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => navigate("/staff")}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Staff
      </Button>

      <div className="max-w-2xl">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Staff Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Personal Details</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    placeholder="Enter first name"
                    value={formData.firstName}
                    onChange={(e) => handleChange("firstName", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    placeholder="Enter last name"
                    value={formData.lastName}
                    onChange={(e) => handleChange("lastName", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                      +255
                    </span>
                    <Input
                      id="phone"
                      placeholder="Enter Phone Number"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      className="rounded-l-none"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  placeholder="Enter address"
                  rows={2}
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                />
              </div>

              {/* Profile Image */}
              <div className="space-y-2">
                <Label>Profile Image</Label>
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-dashed border-muted-foreground/25">
                    {formData.imageUrl ? (
                      <img src={formData.imageUrl} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      <Upload className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <Input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="image-upload"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file);
                      }}
                      disabled={isUploading}
                    />
                    <Label htmlFor="image-upload" className="cursor-pointer">
                      <Button type="button" variant="outline" size="sm" asChild>
                        <span>
                          {isUploading ? "Uploading..." : "Upload Image"}
                        </span>
                      </Button>
                    </Label>
                  </div>
                </div>
              </div>
            </div>

            {/* Employment Information */}
            <div className="space-y-4 pt-4 border-t border-border">
              <h3 className="text-sm font-medium text-muted-foreground">Employment Details</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select
                    value={formData.departmentId?.toString() || ""}
                    onValueChange={(value) => handleChange("departmentId", value ? parseInt(value) : undefined)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id.toString()}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Position</Label>
                  <Select
                    value={formData.roleId?.toString() || ""}
                    onValueChange={(value) => handleChange("roleId", value ? parseInt(value) : undefined)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredRoles.length > 0 ? (
                        filteredRoles.map((role) => (
                          <SelectItem key={role.id} value={role.id.toString()}>
                            {role.name}
                          </SelectItem>
                        ))
                      ) : (
                        staffRoles.map((role) => (
                          <SelectItem key={role.id} value={role.id.toString()}>
                            {role.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hireDate">Hire Date</Label>
                  <Input
                    id="hireDate"
                    type="date"
                    value={formData.hireDate}
                    onChange={(e) => handleChange("hireDate", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleChange("status", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                      <SelectItem value="ON_LEAVE">On Leave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional notes about this staff member..."
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/staff")}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="gradient-primary text-primary-foreground shadow-glow"
            disabled={isLoading}
            onClick={handleSubmit}
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Updating..." : "Update Staff Member"}
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default StaffEdit;
