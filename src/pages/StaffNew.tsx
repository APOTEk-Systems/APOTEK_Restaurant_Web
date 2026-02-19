import { useState } from "react";
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
import { ArrowLeft, Save, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { staffService, CreateStaffData } from "@/services/staffService";
import { useToast } from "@/hooks/use-toast";

// Validate Tanzanian phone numbers
function isValidPhoneNumber(phone: string): boolean {
  // Remove any spaces
  const cleaned = phone.replace(/\s/g, "");
  
  // Empty string is allowed (optional field)
  if (!cleaned) return true;
  
  // Pattern 1: exactly 9 digits (e.g., 678636422)
  if (/^\d{9}$/.test(cleaned)) {
    return true;
  }
  
  // Pattern 2: +255 followed by 9 digits (e.g., +255678636422)
  if (/^\+255\d{9}$/.test(cleaned)) {
    return true;
  }
  
  // Pattern 3: 0 followed by 9 digits (e.g., 0770339889)
  if (/^0\d{9}$/.test(cleaned)) {
    return true;
  }
  
  return false;
}

// Transform phone number to backend format (+255XXXXXXXXX)
function transformPhoneForBackend(phone: string): string {
  const cleaned = phone.replace(/\s/g, "");
  
  // Empty string
  if (!cleaned) return cleaned;
  
  // Already has +255 prefix
  if (/^\+255\d{9}$/.test(cleaned)) {
    return cleaned;
  }
  
  // Just 9 digits, prepend +255
  if (/^\d{9}$/.test(cleaned)) {
    return "+255" + cleaned;
  }
  
  // Starts with 0, convert to +255 (legacy support)
  if (/^0\d{9}$/.test(cleaned)) {
    return "+255" + cleaned.substring(1);
  }
  
  // Return original if it doesn't match expected patterns
  return cleaned;
}

const StaffNew = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [phoneError, setPhoneError] = useState<string>("");

  const [formData, setFormData] = useState<CreateStaffData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    department: "",
    hireDate: new Date().toISOString().split("T")[0],
    status: "ACTIVE",
    role: "STAFF",
    imageUrl: "",
    emergencyContact: "",
    notes: "",
  });

  const handleChange = (field: keyof CreateStaffData, value: string | number | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear phone error when user types
    if (field === "phone") {
      setPhoneError("");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const result = await staffService.uploadImage(file);
      setImageUrl(result.imageUrl);
      setFormData(prev => ({ ...prev, imageUrl: result.imageUrl }));
      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate phone before submitting
    if (formData.phone && !isValidPhoneNumber(formData.phone)) {
      setPhoneError("Invalid format. Use: 9 digits, 0XX..., or +255XX...");
      return;
    }
    
    setIsLoading(true);

    try {
      // Transform phone number for backend
      const staffData: CreateStaffData = {
        ...formData,
        phone: transformPhoneForBackend(formData.phone || ""),
        hireDate: formData.hireDate ? new Date(formData.hireDate).toISOString() : new Date().toISOString(),
      };

      await staffService.create(staffData);
      
      toast({
        title: "Success",
        description: "Staff member created successfully",
      });
      navigate("/staff");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create staff member",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout 
      title="Add Staff Member" 
      subtitle="Add a new employee to your team"
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
            <form onSubmit={handleSubmit}>
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
                        className={`rounded-l-none ${phoneError ? "border-destructive" : ""}`}
                      />
                    </div>
                    {phoneError && (
                      <p className="text-xs text-destructive">{phoneError}</p>
                    )}
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
                      {imageUrl ? (
                        <img src={imageUrl} alt="Profile" className="h-full w-full object-cover" />
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
                        onChange={handleImageUpload}
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
              <div className="space-y-4 pt-4 border-border">
                <h3 className="text-sm font-medium text-muted-foreground">Employment Details</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="role">Role *</Label>
                    <Select 
                      value={formData.role} 
                      onValueChange={(value) => handleChange("role", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MANAGER">Manager</SelectItem>
                        <SelectItem value="WAITER">Waiter</SelectItem>
                        <SelectItem value="CHEF">Chef</SelectItem>
                        <SelectItem value="BARISTA">Barista</SelectItem>
                        <SelectItem value="CASHIER">Cashier</SelectItem>
                        <SelectItem value="BARTENDER">Bartender</SelectItem>
                        <SelectItem value="HOST">Host</SelectItem>
                        <SelectItem value="LINE_COOK">Line Cook</SelectItem>
                        <SelectItem value="DISHWASHER">Dishwasher</SelectItem>
                        <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                        <SelectItem value="STAFF">Staff</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Select 
                      value={formData.department} 
                      onValueChange={(value) => handleChange("department", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="KITCHEN">Kitchen</SelectItem>
                        <SelectItem value="BAR">Bar</SelectItem>
                        <SelectItem value="SERVICE">Front of House</SelectItem>
                        <SelectItem value="OPERATIONS">Operations</SelectItem>
                        <SelectItem value="MANAGEMENT">Management</SelectItem>
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
              <div className="space-y-4 pt-4 border-border">
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

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button 
                  type="submit"
                  className="gradient-primary text-primary-foreground shadow-glow"
                  disabled={isLoading}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? "Creating..." : "Add Staff Member"}
                </Button>
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/staff")}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default StaffNew;