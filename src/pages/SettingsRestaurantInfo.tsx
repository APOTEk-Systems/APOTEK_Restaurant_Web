import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { settingsService, GenericSettings } from "@/services/settingsService";
import { toast } from "sonner";

const SETTINGS_KEYS = {
  restaurant_name: 'restaurant_name',
  registration_number: 'registration_number',
  tin_number: 'tin_number',
  vrn_number: 'vrn_number',
  phone_number: 'phone_number',
  email_address: 'email_address',
  website: 'website',
  logo: 'logo',
} as const;

const SettingsRestaurantInfo = () => {
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<GenericSettings>({});

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsService.getAllSettings(),
  });

  // Update formData when settings load
  useEffect(() => {
    if (settings && Object.keys(formData).length === 0) {
      setFormData(settings);
    }
  }, [settings, formData]);

  const updateSettingsMutation = useMutation({
    mutationFn: (data: GenericSettings) => settingsService.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Settings saved successfully');
      setIsEditing(false);
    },
    onError: () => {
      toast.error('Failed to save settings');
    },
  });

  const handleSave = () => {
    updateSettingsMutation.mutate(formData);
  };

  const handleCancel = () => {
    setFormData(settings || {});
    setIsEditing(false);
  };

  const handleInputChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleInputChange('logo', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const renderViewField = (label: string, value?: string) => (
    <div className="space-y-1">
      <Label className="text-muted-foreground text-xs">{label}</Label>
      <p className="text-sm font-medium">{value || '-'}</p>
    </div>
  );

  const renderEditField = (
    label: string,
    key: string,
    type: string = 'text'
  ) => (
    <div className="space-y-2">
      <Label htmlFor={key}>{label}</Label>
      {key === 'logo' ? (
        <div className="space-y-2">
          {formData.logo && (
            <img
              src={formData.logo}
              alt="Restaurant Logo"
              className="w-32 h-32 object-contain border rounded-md"
            />
          )}
          <Input
            id={key}
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
          />
        </div>
      ) : (
        <Input
          id={key}
          type={type}
          value={formData[key] || ''}
          onChange={(e) => handleInputChange(key, e.target.value)}
          placeholder={`Enter ${label.toLowerCase()}`}
        />
      )}
    </div>
  );

  if (isLoading) {
    return (
      <MainLayout title="Restaurant Information" subtitle="Loading...">
        <div className="flex items-center justify-center h-64">
          <p>Loading settings...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout 
      title="Restaurant Information" 
      subtitle="Manage your restaurant's basic information and details"
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Your restaurant's core details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {isEditing ? (
                <>
                  {renderEditField('Restaurant Name', 'restaurant_name')}
                  {renderEditField('Registration Number', 'registration_number')}
                </>
              ) : (
                <>
                  {renderViewField('Restaurant Name', settings?.restaurant_name)}
                  {renderViewField('Registration Number', settings?.registration_number)}
                </>
              )}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {isEditing ? (
                <>
                  {renderEditField('TIN Number', 'tin_number')}
                  {renderEditField('VRN Number', 'vrn_number')}
                </>
              ) : (
                <>
                  {renderViewField('TIN Number', settings?.tin_number)}
                  {renderViewField('VRN Number', settings?.vrn_number)}
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>How customers can reach you</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {isEditing ? (
                <>
                  {renderEditField('Phone Number', 'phone_number', 'tel')}
                  {renderEditField('Email Address', 'email_address', 'email')}
                </>
              ) : (
                <>
                  {renderViewField('Phone Number', settings?.phone_number)}
                  {renderViewField('Email Address', settings?.email_address)}
                </>
              )}
            </div>
            <div className="space-y-2">
              {isEditing ? (
                renderEditField('Website', 'website', 'url')
              ) : (
                renderViewField('Website', settings?.website)
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Restaurant Logo</CardTitle>
            <CardDescription>Your restaurant's logo</CardDescription>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              renderEditField('Logo', 'logo')
            ) : settings?.logo ? (
              <img
                src={settings.logo}
                alt="Restaurant Logo"
                className="w-48 h-48 object-contain border rounded-md"
              />
            ) : (
              <p className="text-muted-foreground text-sm">No logo uploaded</p>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel} disabled={updateSettingsMutation.isPending}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={updateSettingsMutation.isPending}>
                {updateSettingsMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)} disabled={isLoading}>
              Edit Information
            </Button>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default SettingsRestaurantInfo;
