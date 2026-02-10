import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { InventoryCategory } from "@/services/inventoryService";

interface SupplierFormData {
  name: string;
  category: string;
  contact: string;
  phone: string;
  email: string;
  status: string;
}

interface SupplierFormProps {
  mode: "create" | "edit";
  initialData?: Partial<SupplierFormData>;
  categories: InventoryCategory[];
  isPending: boolean;
  onSubmit: (data: SupplierFormData) => void;
  onCancel: () => void;
}

// Validate Tanzanian phone numbers
function isValidPhoneNumber(phone: string): boolean {
  // Remove any spaces
  const cleaned = phone.replace(/\s/g, "");
  
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

export function SupplierForm({
  mode,
  initialData,
  categories,
  isPending,
  onSubmit,
  onCancel,
}: SupplierFormProps) {
  const [formData, setFormData] = useState<SupplierFormData>({
    name: initialData?.name || "",
    category: initialData?.category || "",
    contact: initialData?.contact || "",
    phone: initialData?.phone || "",
    email: initialData?.email || "",
    status: initialData?.status || "ACTIVE",
  });

  const [phoneError, setPhoneError] = useState<string>("");

  const handleChange = (field: keyof SupplierFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Clear phone error when user types
    if (field === "phone") {
      setPhoneError("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate phone before submitting
    if (formData.phone && !isValidPhoneNumber(formData.phone)) {
      setPhoneError("Invalid format. Use: 9 digits, 0XX..., or +255XX...");
      return;
    }
    
    // Transform phone number for backend
    const transformedData = {
      ...formData,
      phone: transformPhoneForBackend(formData.phone),
    };
    
    onSubmit(transformedData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`${mode}-name`} className="text-sm font-medium">
            Supplier Name *
          </Label>
          <Input
            id={`${mode}-name`}
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="Enter supplier name"
            required
            className="h-9"
            autoComplete="off"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${mode}-category`} className="text-sm font-medium">
            Category *
          </Label>
          <Select
            value={formData.category}
            onValueChange={(value) => handleChange("category", value)}
          >
            <SelectTrigger id={`${mode}-category`} className="h-9">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.name}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`${mode}-contact`} className="text-sm font-medium">
            Contact Person *
          </Label>
          <Input
            id={`${mode}-contact`}
            value={formData.contact}
            onChange={(e) => handleChange("contact", e.target.value)}
            placeholder="Enter contact name"
            required
            className="h-9"
            autoComplete="off"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${mode}-phone`} className="text-sm font-medium">
            Phone *
          </Label>
          <div className="flex">
            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
              +255
            </span>
            <Input
              id={`${mode}-phone`}
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              placeholder="e.g., 678 636 422, 0770..., +255..."
              required
              className={`rounded-l-none ${phoneError ? "border-destructive" : ""}`}
              autoComplete="off"
            />
          </div>
          {phoneError && (
            <p className="text-xs text-destructive">{phoneError}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${mode}-email`} className="text-sm font-medium">
          Email *
        </Label>
        <Input
          id={`${mode}-email`}
          type="email"
          value={formData.email}
          onChange={(e) => handleChange("email", e.target.value)}
          placeholder="Enter email address"
          required
          className="h-9"
          autoComplete="off"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${mode}-status`} className="text-sm font-medium">
          Status
        </Label>
        <Select
          value={formData.status}
          onValueChange={(value) => handleChange("status", value)}
        >
          <SelectTrigger id={`${mode}-status`} className="h-9">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="INACTIVE">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          className="gradient-primary text-primary-foreground shadow-glow hover:shadow-lg transition-shadow"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {mode === "create" ? "Creating..." : "Saving..."}
            </>
          ) : mode === "create" ? (
            "Create Supplier"
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </form>
  );
}

SupplierForm.displayName = "SupplierForm";