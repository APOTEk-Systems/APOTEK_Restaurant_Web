import { useState, lazy, Suspense, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Save, Loader2, Check } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { staffService, CreateStaffData } from "@/services/staffService";
import { departmentService } from "@/services/departmentService";
import { staffRoleService } from "@/services/staffRoleService";
import { userService } from "@/services/userService";
import { userGroupService } from "@/services/userGroupService";
import { permissionService } from "@/services/permissionService";

// Lazy load step components
const StaffInfoStep = lazy(() => import("./steps/StaffInfoStep"));
const UserAccountStep = lazy(() => import("./steps/UserAccountStep"));
const PermissionStep = lazy(() => import("./steps/PermissionStep"));

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
  
  // Multi-step form state
  const [currentStep, setCurrentStep] = useState(1);
  const [canAccessSystem, setCanAccessSystem] = useState(false);
  
  // Form data shared across steps
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

  const [userFormData, setUserFormData] = useState({
    username: "",
    password: "",
    userGroupId: undefined as number | undefined,
  });

  const [permissionOverrides, setPermissionOverrides] = useState<{ permissionId: number; allowed: boolean }[]>([]);

  // React Query for data fetching
  const { data: departments = [], isLoading: loadingDepartments } = useQuery({
    queryKey: ['departments'],
    queryFn: () => departmentService.getAll(),
  });

  const { data: staffRoles = [], isLoading: loadingRoles } = useQuery({
    queryKey: ['staff-roles'],
    queryFn: () => staffRoleService.getAll(),
  });

  const { data: userGroups = [], isLoading: loadingGroups } = useQuery({
    queryKey: ['user-groups'],
    queryFn: () => userGroupService.getAll(),
  });

  const { data: allPermissions = [], isLoading: loadingPermissions } = useQuery({
    queryKey: ['permissions'],
    queryFn: () => permissionService.getAll(),
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

  const isLoadingData = loadingDepartments || loadingRoles || loadingGroups || loadingPermissions || (isEditMode && loadingStaff);

  const handleChange = (field: keyof CreateStaffData, value: string | number | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleUserFormChange = (field: string, value: string | number | undefined) => {
    setUserFormData(prev => ({ ...prev, [field]: value }));
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
        const createdStaff = await staffService.create(staffData);
        
        // If user can access system, create user account
        if (canAccessSystem && userFormData.username && userFormData.password && userFormData.userGroupId) {
          const createdUser = await userService.create({
            username: userFormData.username,
            password: userFormData.password,
            email: formData.email || undefined,
            staffId: createdStaff.id,
            userGroupId: userFormData.userGroupId,
          });

          // Handle permission overrides if any
          if (permissionOverrides.length > 0) {
            for (const override of permissionOverrides) {
              await userService.updatePermission(createdUser.id, override.permissionId, override.allowed);
            }
          }
        }
        
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

  const nextStep = () => {
    if (currentStep === 1) {
      if (canAccessSystem) {
        setCurrentStep(2);
      } else {
        handleSubmit();
      }
    } else if (currentStep === 2) {
      setCurrentStep(3);
    }
  };

  const prevStep = () => {
    if (currentStep === 3) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(1);
    }
  };

  // Determine total steps
  const totalSteps = canAccessSystem ? 3 : 1;

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

      {/* Step Indicators */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center gap-2">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            {currentStep > 1 ? <Check className="h-4 w-4" /> : "1"}
          </div>
          <span className="text-sm">Staff Info</span>
        </div>
        {canAccessSystem && (
          <>
            <div className="w-8 h-px bg-border mx-2" />
            <div className="flex items-center gap-2">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                {currentStep > 2 ? <Check className="h-4 w-4" /> : "2"}
              </div>
              <span className="text-sm">User Account</span>
            </div>
            <div className="w-8 h-px bg-border mx-2" />
            <div className="flex items-center gap-2">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                3
              </div>
              <span className="text-sm">Permissions</span>
            </div>
          </>
        )}
      </div>

      <div className="max-w-2xl">
        <Suspense fallback={
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        }>
          {currentStep === 1 && (
            <StaffInfoStep
              formData={formData}
              onChange={handleChange}
              onImageUpload={handleImageUpload}
              canAccessSystem={canAccessSystem}
              setCanAccessSystem={setCanAccessSystem}
              departments={departments}
              staffRoles={staffRoles}
            />
          )}

          {currentStep === 2 && canAccessSystem && (
            <UserAccountStep
              userFormData={userFormData}
              onChange={handleUserFormChange}
              userGroups={userGroups}
              onSkipPermissions={() => handleSubmit()}
            />
          )}

          {currentStep === 3 && (
            <PermissionStep
              permissions={allPermissions}
              userGroups={userGroups}
              userGroupId={userFormData.userGroupId}
              permissionOverrides={permissionOverrides}
              setPermissionOverrides={setPermissionOverrides}
            />
          )}
        </Suspense>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          {currentStep > 1 && (
            <Button 
              type="button"
              variant="outline"
              onClick={prevStep}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
          )}
          
          {currentStep < totalSteps && (
            <Button 
              type="button"
              onClick={nextStep}
              disabled={currentStep === 2 && (!userFormData.username || !userFormData.password || !userFormData.userGroupId)}
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
          
          {currentStep === totalSteps && (
            <Button 
              type="button"
              className="gradient-primary text-primary-foreground shadow-glow"
              disabled={isLoading}
              onClick={handleSubmit}
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? "Saving..." : isEditMode ? "Update Staff Member" : "Create Staff Member"}
            </Button>
          )}
          
          {currentStep === 1 && !canAccessSystem && (
            <Button 
              type="button"
              className="gradient-primary text-primary-foreground shadow-glow"
              disabled={isLoading}
              onClick={handleSubmit}
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? "Saving..." : isEditMode ? "Update Staff Member" : "Add Staff Member"}
            </Button>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default StaffNew;