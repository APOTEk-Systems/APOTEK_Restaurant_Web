import { useState, lazy, Suspense, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { staffService, CreateStaffData } from "@/services/staffService";
import { departmentService } from "@/services/departmentService";
import { staffRoleService } from "@/services/staffRoleService";

// Lazy load step components
const StaffInfoStep = lazy(() => import("./steps/StaffInfoStep"));

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

const StaffNew = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  
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

  // Fetch existing staff if in edit mode
  const { data: existingStaff, isLoading: loadingStaff } = useQuery({
    queryKey: ['staff', id],
    queryFn: () => staffService.getById(Number(id)),
    enabled: isEditMode && Boolean(id),
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

  const isLoadingData = loadingDepartments || loadingRoles || (isEditMode && loadingStaff);

  const handleChange = (field: keyof CreateStaffData, value: string | number | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    const result = await staffService.uploadImage(file);
    setFormData(prev => ({ ...prev, imageUrl: result.imageUrl }));
    return result.imageUrl;
  };

  const handleSubmit = async () => {
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

      if (isEditMode && id) {
        // Update existing staff
        await staffService.update(Number(id), staffData);
        toast({
          title: "Success",
          description: "Staff member updated successfully",
        });
        navigate("/staff");
      } else {
        // Create new staff
        await staffService.create(staffData);
        toast({
          title: "Success",
          description: "Staff member created successfully",
        });
        navigate("/staff");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save staff member",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) {
    return (
      <MainLayout title={isEditMode ? "Edit Staff Member" : "Add Staff Member"} subtitle={isEditMode ? "Update staff information" : "Add a new employee to your team"}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      title={isEditMode ? "Edit Staff Member" : "Add Staff Member"}
      subtitle={isEditMode ? "Update staff information" : "Add a new employee to your team"}
    >
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => navigate("/staff")}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Staff
      </Button>

      <div className="max-w-4xl">
        <Suspense fallback={
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        }>
          <StaffInfoStep
            formData={formData}
            onChange={handleChange}
            onImageUpload={handleImageUpload}
            departments={departments}
            staffRoles={staffRoles}
          />
        </Suspense>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            className="gradient-primary text-primary-foreground shadow-glow"
            disabled={isLoading}
            onClick={handleSubmit}
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Saving..." : isEditMode ? "Update Staff Member" : "Add Staff Member"}
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default StaffNew;