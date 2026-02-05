import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { settingsService, GenericSettings } from "@/services/settingsService";
import { toast } from "sonner";

const SettingsConfigurations = () => {
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<GenericSettings>({});

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsService.getAllSettings(),
  });

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

  // Update formData when settings load
  useEffect(() => {
    if (settings && Object.keys(formData).length === 0) {
      setFormData(settings);
    }
  }, [settings, formData]);

  const handleSave = () => {
    updateSettingsMutation.mutate(formData);
  };

  const handleCancel = () => {
    setFormData(settings || {});
    setIsEditing(false);
  };

  const handleSwitchChange = (key: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [key]: checked ? 'true' : 'false' }));
  };

  const handleSelectChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleInputChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const renderViewSwitch = (label: string, description: string, value?: string) => (
    <div className="flex items-center justify-between">
      <div className="space-y-0.5">
        <Label>{label}</Label>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch checked={value === 'true'} disabled />
    </div>
  );

  const renderEditSwitch = (label: string, description: string, key: string) => (
    <div className="flex items-center justify-between">
      <div className="space-y-0.5">
        <Label>{label}</Label>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch 
        checked={formData[key] === 'true'} 
        onCheckedChange={(checked) => handleSwitchChange(key, checked)}
      />
    </div>
  );

  const renderViewSelect = (label: string, options: { value: string; label: string }[], value?: string) => {
    const selectedOption = options.find(opt => opt.value === value);
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <Select value={value} disabled>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            {options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  };

  const renderEditSelect = (label: string, options: { value: string; label: string }[], key: string) => (
    <div className="space-y-2">
      <Label htmlFor={key}>{label}</Label>
      <Select value={formData[key]} onValueChange={(value) => handleSelectChange(key, value)}>
        <SelectTrigger>
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  const renderViewInput = (label: string, value?: string, type: string = 'text') => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input value={value || ''} disabled type={type} />
    </div>
  );

  const renderEditInput = (label: string, key: string, type: string = 'text') => (
    <div className="space-y-2">
      <Label htmlFor={key}>{label}</Label>
      <Input
        id={key}
        type={type}
        value={formData[key] || ''}
        onChange={(e) => handleInputChange(key, e.target.value)}
      />
    </div>
  );

  if (isLoading) {
    return (
      <MainLayout title="Configurations" subtitle="Loading...">
        <div className="flex items-center justify-center h-64">
          <p>Loading settings...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout 
      title="Configurations" 
      subtitle="System-wide settings and preferences"
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Configure basic system preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isEditing ? (
              <>
                {renderEditSwitch('Dark Mode', 'Enable dark theme for the interface', 'dark_mode')}
                {renderEditSwitch('Sound Notifications', 'Play sounds for new orders and alerts', 'sound_notifications')}
                {renderEditSwitch('Auto Print Orders', 'Automatically print kitchen tickets', 'auto_print_orders')}
              </>
            ) : (
              <>
                {renderViewSwitch('Dark Mode', 'Enable dark theme for the interface', settings?.dark_mode)}
                {renderViewSwitch('Sound Notifications', 'Play sounds for new orders and alerts', settings?.sound_notifications)}
                {renderViewSwitch('Auto Print Orders', 'Automatically print kitchen tickets', settings?.auto_print_orders)}
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Currency & Tax</CardTitle>
            <CardDescription>Financial configuration settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {isEditing ? (
                <>
                  {renderEditSelect('Currency', [
                    { value: 'usd', label: 'USD ($)' },
                    { value: 'eur', label: 'EUR (€)' },
                    { value: 'gbp', label: 'GBP (£)' },
                    { value: 'cad', label: 'CAD ($)' },
                  ], 'currency')}
                  {renderEditInput('Default Tax Rate (%)', 'tax_rate', 'number')}
                </>
              ) : (
                <>
                  {renderViewSelect('Currency', [
                    { value: 'usd', label: 'USD ($)' },
                    { value: 'eur', label: 'EUR (€)' },
                    { value: 'gbp', label: 'GBP (£)' },
                    { value: 'cad', label: 'CAD ($)' },
                  ], settings?.currency)}
                  {renderViewInput('Default Tax Rate (%)', settings?.tax_rate, 'number')}
                </>
              )}
            </div>
            {isEditing ? (
              renderEditSwitch('Include Tax in Prices', 'Display prices with tax included', 'include_tax_in_prices')
            ) : (
              renderViewSwitch('Include Tax in Prices', 'Display prices with tax included', settings?.include_tax_in_prices)
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Settings</CardTitle>
            <CardDescription>Configure order management behavior</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {isEditing ? (
                <>
                  {renderEditInput('Order Number Prefix', 'order_prefix')}
                  {renderEditInput('Number of Tables', 'table_count', 'number')}
                </>
              ) : (
                <>
                  {renderViewInput('Order Number Prefix', settings?.order_prefix)}
                  {renderViewInput('Number of Tables', settings?.table_count, 'number')}
                </>
              )}
            </div>
            {isEditing ? (
              <>
                {renderEditSwitch('Require Table Number', 'Mandate table selection for dine-in orders', 'require_table_number')}
                {renderEditSwitch('Allow Order Modifications', 'Enable editing of sent orders', 'allow_order_modifications')}
              </>
            ) : (
              <>
                {renderViewSwitch('Require Table Number', 'Mandate table selection for dine-in orders', settings?.require_table_number)}
                {renderViewSwitch('Allow Order Modifications', 'Enable editing of sent orders', settings?.allow_order_modifications)}
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Receipt Settings</CardTitle>
            <CardDescription>Customize receipt printing and content</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <>
                {renderEditInput('Receipt Header Text', 'receipt_header')}
                {renderEditInput('Receipt Footer Text', 'receipt_footer')}
                {renderEditSwitch('Show Logo on Receipt', 'Print restaurant logo on receipts', 'show_logo_on_receipt')}
              </>
            ) : (
              <>
                {renderViewInput('Receipt Header Text', settings?.receipt_header)}
                {renderViewInput('Receipt Footer Text', settings?.receipt_footer)}
                {renderViewSwitch('Show Logo on Receipt', 'Print restaurant logo on receipts', settings?.show_logo_on_receipt)}
              </>
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
                {updateSettingsMutation.isPending ? 'Saving...' : 'Save Configurations'}
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)} disabled={isLoading}>
              Edit Configurations
            </Button>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default SettingsConfigurations;
