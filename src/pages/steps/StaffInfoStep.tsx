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
import { Upload } from "lucide-react";
import { useState, useMemo } from "react";
import type { CreateStaffData, Department, StaffRole } from "@/services/staffService";

interface StaffInfoStepProps {
  formData: CreateStaffData;
  onChange: (field: keyof CreateStaffData, value: string | number | undefined) => void;
  onImageUpload: (file: File) => Promise<string>;
  departments: Department[];
  staffRoles: StaffRole[];
}

export default function StaffInfoStep({
  formData,
  onChange,
  onImageUpload,
  departments,
  staffRoles,
}: StaffInfoStepProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [phoneError, setPhoneError] = useState<string>("");

  // Filter roles based on selected department
  const filteredRoles = useMemo(() => {
    if (!formData.departmentId) return staffRoles;
    return staffRoles.filter(role => role.departmentId === formData.departmentId);
  }, [formData.departmentId, staffRoles]);

  const handlePhoneChange = (value: string) => {
    onChange("phone", value);
    setPhoneError("");
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      await onImageUpload(file);
    } catch (error) {
      console.error("Failed to upload image:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full bg-card border-border">
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
                onChange={(e) => onChange("firstName", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input 
                id="lastName" 
                placeholder="Enter last name" 
                value={formData.lastName}
                onChange={(e) => onChange("lastName", e.target.value)}
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
                onChange={(e) => onChange("email", e.target.value)}
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
                  onChange={(e) => handlePhoneChange(e.target.value)}
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
              onChange={(e) => onChange("address", e.target.value)}
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
                  onChange={handleImageChange}
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
                onValueChange={(value) => onChange("departmentId", value ? parseInt(value) : undefined)}
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
              <Label htmlFor="role">Postion</Label>
              <Select
                value={formData.roleId?.toString() || ""}
                onValueChange={(value) => onChange("roleId", value ? parseInt(value) : undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select position" />
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
                onChange={(e) => onChange("hireDate", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => onChange("status", value)}
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

        {/* Emergency Contact - Commented out */}
        {/* <div className="space-y-4 pt-4 border-t border-border">
          <h3 className="text-sm font-medium text-muted-foreground">Emergency Contact</h3>
          <div className="space-y-2">
            <Label htmlFor="emergencyContact">Contact Info</Label>
            <Input
              id="emergencyContact"
              placeholder="Name - Phone"
              value={formData.emergencyContact}
              onChange={(e) => onChange("emergencyContact", e.target.value)}
            />
          </div>
        </div> */}

        {/* Notes */}
        <div className="space-y-4 pt-4 border-t border-border">
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea 
              id="notes" 
              placeholder="Any additional notes about this staff member..."
              rows={3}
              value={formData.notes}
              onChange={(e) => onChange("notes", e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}