import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import type { UserGroup } from "@/services/userGroupService";

interface UserFormData {
  username: string;
  password: string;
  userGroupId: number | undefined;
}

interface UserAccountStepProps {
  userFormData: UserFormData;
  onChange: (field: string, value: string | number | undefined) => void;
  userGroups: UserGroup[];
  onSkipPermissions: () => void;
}

export default function UserAccountStep({
  userFormData,
  onChange,
  userGroups,
  onSkipPermissions,
}: UserAccountStepProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>User Account</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Create login credentials for this staff member. The username and permissions will be based on the selected group.
        </p>

        <div className="space-y-2">
          <Label htmlFor="username">Username *</Label>
          <Input 
            id="username" 
            placeholder="Enter username" 
            value={userFormData.username}
            onChange={(e) => onChange("username", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password *</Label>
          <Input 
            id="password" 
            type="password"
            placeholder="Enter password" 
            value={userFormData.password}
            onChange={(e) => onChange("password", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="userGroup">User Group *</Label>
          <Select 
            value={userFormData.userGroupId?.toString() || ""} 
            onValueChange={(value) => onChange("userGroupId", value ? parseInt(value) : undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select user group" />
            </SelectTrigger>
            <SelectContent>
              {userGroups.filter(g => g.isActive).map((group) => (
                <SelectItem key={group.id} value={group.id.toString()}>
                  {group.name} {group.isDefault && "(Default)"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            The user will inherit permissions from this group. You can customize permissions in the next step.
          </p>
        </div>

        <div className="pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onSkipPermissions}
          >
            Skip Permissions Modifications
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}